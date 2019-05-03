import { ICoinProtocol } from '../ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import * as nacl from 'tweetnacl'
import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios from 'axios'
import * as rlp from 'rlp'
import * as bs58check from 'bs58check'
import bs64check from '../../utils/base64Check'
import {
  RawAeternityTransaction,
  UnsignedAeternityTransaction
} from '../../serializer/unsigned-transactions/aeternity-transactions.serializer'
import { SignedAeternityTransaction } from '../../serializer/signed-transactions/aeternity-transactions.serializer'
import * as Web3 from 'web3'
import { padStart } from '../../utils/padStart'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

export class AEProtocol extends NonExtendedProtocol implements ICoinProtocol {
  symbol = 'AE'
  name = 'æternity'
  marketSymbol = 'ae'

  feeSymbol = 'ae'

  decimals = 18
  feeDecimals = 18
  identifier = 'ae'

  feeDefaults = {
    low: new BigNumber('0.00021'), // 21000 Gas * 2 Gwei
    medium: new BigNumber('0.000315'), // 21000 Gas * 15 Gwei
    high: new BigNumber('0.00084') // 21000 Gas * 40 Gwei
  }

  units = [
    {
      unitSymbol: 'AE',
      factor: new BigNumber(1)
    }
  ]

  supportsHD = false
  standardDerivationPath = `m/44h/457h/0h/0h/0h`

  addressIsCaseSensitive = true
  addressValidationPattern = '^ak_+[1-9A-Za-z]{49,50}$'
  addressPlaceholder = 'ak_abc...'

  blockExplorer = 'https://explorer.aepps.com'

  // ae specifics
  defaultNetworkId = 'ae_mainnet'

  epochMiddleware = 'https://ae-epoch-rpc-proxy.gke.papers.tech'

  constructor(public epochRPC = 'https://ae-epoch-rpc-proxy.gke.papers.tech') {
    super()
  }

  getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/#/account/{{address}}/`.replace('{{address}}', address)
  }

  getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/#/tx/{{txId}}/`.replace('{{txId}}', txId)
  }

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const { publicKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(secretKey)
  }

  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    const base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))
    return `ak_${base58}`
  }

  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return [address]
  }

  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([await this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const allTransactions = await Promise.all(
      addresses.map(address => {
        return axios.get(`${this.epochMiddleware}/middleware/transactions/account/${address}`)
      })
    )

    const transactions: any[] = [].concat(
      ...allTransactions.map(axiosData => {
        return axiosData.data || []
      })
    )

    return transactions.map(obj => {
      const parsedTimestamp = parseInt(obj.time, 10)
      const airGapTx: IAirGapTransaction = {
        amount: new BigNumber(obj.tx.amount),
        fee: new BigNumber(obj.tx.fee),
        from: [obj.tx.sender_id],
        isInbound: addresses.indexOf(obj.tx.recipient_id) !== -1,
        protocolIdentifier: this.identifier,
        to: [obj.tx.recipient_id],
        hash: obj.hash,
        blockHeight: obj.block_height
      }

      if (!isNaN(parsedTimestamp)) {
        airGapTx.timestamp = Math.round(parsedTimestamp / 1000)
      }

      return airGapTx
    })
  }

  async signWithPrivateKey(privateKey: Buffer, transaction: RawAeternityTransaction): Promise<IAirGapSignedTransaction> {
    // sign and cut off first byte ('ae')
    const rawTx = this.decodeTx(transaction.transaction)

    const signature = nacl.sign.detached(Buffer.concat([Buffer.from(transaction.networkId), rawTx]), privateKey)

    const txObj = {
      tag: this.toHexBuffer(11),
      version: this.toHexBuffer(1),
      signatures: [Buffer.from(signature)],
      transaction: rawTx
    }

    const txArray = Object.keys(txObj).map(a => txObj[a])

    const rlpEncodedTx = rlp.encode(txArray)
    const signedEncodedTx = `tx_${bs64check.encode(rlpEncodedTx)}`

    return signedEncodedTx
  }

  private decodeTx(transaction: string): any {
    let rawTx: any

    try {
      rawTx = bs64check.decode(transaction.replace('tx_', ''))
      return rawTx
    } catch (error) {
      //
    }

    try {
      rawTx = bs58check.decode(transaction.replace('tx_', ''))
      return rawTx
    } catch (error) {
      //
    }

    throw new Error('invalid TX-encoding')
  }

  async getTransactionDetails(unsignedTx: UnsignedAeternityTransaction): Promise<IAirGapTransaction> {
    const transaction = unsignedTx.transaction.transaction
    const rlpEncodedTx = this.decodeTx(transaction)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx)

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)),
      from: [await this.getAddressFromPublicKey(rlpDecodedTx[2].slice(1).toString('hex'))],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [await this.getAddressFromPublicKey(rlpDecodedTx[3].slice(1).toString('hex'))]
    }

    return airgapTx
  }

  async getTransactionDetailsFromSigned(signedTx: SignedAeternityTransaction): Promise<IAirGapTransaction> {
    const rlpEncodedTx = this.decodeTx(signedTx.transaction)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx)

    const unsignedAeternityTransaction: UnsignedAeternityTransaction = {
      publicKey: '',
      callback: '',
      transaction: {
        networkId: 'ae_mainnet',
        transaction: `tx_${bs64check.encode(rlpDecodedTx[3])}`
      }
    }

    return this.getTransactionDetails(unsignedAeternityTransaction)
  }

  async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let balance = new BigNumber(0)

    for (let address of addresses) {
      try {
        const { data } = await axios.get(`${this.epochRPC}/v2/accounts/${address}`)
        balance = balance.plus(new BigNumber(data.balance))
      } catch (error) {
        // if node returns 404 (which means 'no account found'), go with 0 balance
        if (error.response.status !== 404) {
          throw error
        }
      }
    }

    return balance
  }

  async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    payload?: string
  ): Promise<RawAeternityTransaction> {
    let nonce = 1

    const address: string = await this.getAddressFromPublicKey(publicKey)

    try {
      const { data: accountResponse } = await axios.get(`${this.epochRPC}/v2/accounts/${address}`)
      nonce = accountResponse.nonce + 1
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with nonce 0
      if (error.response && error.response.status !== 404) {
        throw error
      }
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const sender = publicKey
    const recipient = bs58check.decode(recipients[0].replace('ak_', ''))

    const txObj = {
      tag: this.toHexBuffer(12),
      version: this.toHexBuffer(1),
      sender_id: Buffer.concat([this.toHexBuffer(1), Buffer.from(sender, 'hex')]),
      recipient_id: Buffer.concat([this.toHexBuffer(1), recipient]),
      amount: this.toHexBuffer(values[0]),
      fee: this.toHexBuffer(fee),
      ttl: this.toHexBuffer(0),
      nonce: this.toHexBuffer(nonce),
      payload: Buffer.from(payload || '')
    }

    const txArray = Object.keys(txObj).map(a => txObj[a])
    const rlpEncodedTx = rlp.encode(txArray)
    const preparedTx = `tx_${bs64check.encode(rlpEncodedTx)}`

    return {
      transaction: preparedTx,
      networkId: this.defaultNetworkId
    }
  }

  /**
   * This is a function that we only use to fix incompatibilitis with old vault versions that are unable to understand b64 encoded Txs.
   *
   * @deprecated
   * @param preparedTx
   */
  convertTxToBase58(preparedTx: RawAeternityTransaction): RawAeternityTransaction {
    return {
      transaction: bs58check.encode(bs64check.decode(preparedTx.transaction)),
      networkId: preparedTx.networkId
    }
  }

  async broadcastTransaction(rawTransaction: string): Promise<string> {
    const { data } = await axios.post(
      `${this.epochRPC}/v2/transactions`,
      { tx: rawTransaction },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return data.tx_hash
  }

  private toHexBuffer(value: number | BigNumber): Buffer {
    const hexString: string = Web3.utils.toHex(value).substr(2)
    return Buffer.from(padStart(hexString, hexString.length % 2 === 0 ? hexString.length : hexString.length + 1, '0'), 'hex')
  }
}
