import * as sodium from 'libsodium-wrappers'

import axios from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import { generateWalletUsingDerivationPath } from '../../dependencies/src/hd-wallet-js-b216450e56954a6e82ace0aade9474673de5d9d5/src/index'
import * as rlp from '../../dependencies/src/rlp-2.2.3/index'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedAeternityTransaction } from '../../serializer/schemas/definitions/transaction-sign-request-aeternity'
import { SignedAeternityTransaction } from '../../serializer/schemas/definitions/transaction-sign-response-aeternity'
import { RawAeternityTransaction } from '../../serializer/types'
import bs64check from '../../utils/base64Check'
import { padStart } from '../../utils/padStart'
import { EthereumUtils } from '../ethereum/utils/utils'
import { CurrencyUnit, ICoinProtocol } from '../ICoinProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { mnemonicToSeed } from '../../dependencies/src/bip39-2.5.0/index'

export class AeternityProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = 'AE'
  public name: string = 'æternity'
  public marketSymbol: string = 'ae'

  public feeSymbol: string = 'ae'

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: string = 'ae'

  public feeDefaults = {
    low: '0.00021',
    medium: '0.000315',
    high: '0.00084'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'AE',
      factor: '1'
    }
  ]

  public supportsHD: boolean = false
  public standardDerivationPath: string = `m/44h/457h/0h/0h/0h`

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^ak_+[1-9A-Za-z]{49,50}$'
  public addressPlaceholder: string = 'ak_abc...'

  public blockExplorer: string = 'https://mainnet.aeternal.io'

  // ae specifics
  public defaultNetworkId: string = 'ae_mainnet'

  public epochMiddleware: string = 'https://ae-epoch-rpc-proxy.gke.papers.tech'

  constructor(public epochRPC: string = 'https://ae-epoch-rpc-proxy.gke.papers.tech') {
    super()
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return `${this.blockExplorer}/account/transactions/{{address}}/`.replace('{{address}}', address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return `${this.blockExplorer}/transactions/{{txId}}/`.replace('{{txId}}', txId)
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)
    return this.getPublicKeyFromHexSecret(secret, derivationPath)
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
    const secret = mnemonicToSeed(mnemonic, password)
    return this.getPrivateKeyFromHexSecret(secret, derivationPath)
  }

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const { publicKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return Buffer.from(secretKey)
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    const base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))

    return `ak_${base58}`
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return [address]
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([await this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
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
        amount: new BigNumber(obj.tx.amount).toString(10),
        fee: new BigNumber(obj.tx.fee).toString(10),
        from: [obj.tx.sender_id],
        isInbound: addresses.indexOf(obj.tx.recipient_id) !== -1,
        protocolIdentifier: this.identifier,
        to: [obj.tx.recipient_id],
        hash: obj.hash,
        blockHeight: obj.block_height
      }

      if (obj.tx.payload) {
        airGapTx.data = obj.tx.payload
      }

      if (!isNaN(parsedTimestamp)) {
        airGapTx.timestamp = Math.round(parsedTimestamp / 1000)
      }

      return airGapTx
    })
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawAeternityTransaction): Promise<IAirGapSignedTransaction> {
    // sign and cut off first byte ('ae')
    const rawTx = this.decodeTx(transaction.transaction)

    await sodium.ready
    const signature = sodium.crypto_sign_detached(Buffer.concat([Buffer.from(transaction.networkId), rawTx]), privateKey)

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

  public async getTransactionDetails(unsignedTx: UnsignedAeternityTransaction): Promise<IAirGapTransaction[]> {
    const transaction = unsignedTx.transaction.transaction
    const rlpEncodedTx = this.decodeTx(transaction)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)).toString(10),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)).toString(10),
      from: [await this.getAddressFromPublicKey(rlpDecodedTx[2].slice(1).toString('hex'))],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [await this.getAddressFromPublicKey(rlpDecodedTx[3].slice(1).toString('hex'))],
      data: (rlpDecodedTx[8] || '').toString('utf8'),
      transactionDetails: unsignedTx.transaction
    }

    return [airgapTx]
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedAeternityTransaction): Promise<IAirGapTransaction[]> {
    const rlpEncodedTx = this.decodeTx(signedTx.transaction)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

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

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    let balance = new BigNumber(0)

    for (const address of addresses) {
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

    return balance.toString(10)
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, fee: string): Promise<string> {
    const balance = await this.getBalanceOfPublicKey(publicKey)

    let amountWithoutFees = new BigNumber(balance).minus(new BigNumber(fee))
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }
    return amountWithoutFees.toFixed()
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
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

    const balance: BigNumber = new BigNumber(await this.getBalanceOfPublicKey(publicKey))

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
      amount: this.toHexBuffer(new BigNumber(values[0])),
      fee: this.toHexBuffer(new BigNumber(fee)),
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
  public convertTxToBase58(preparedTx: RawAeternityTransaction): RawAeternityTransaction {
    return {
      transaction: bs58check.encode(bs64check.decode(preparedTx.transaction)),
      networkId: preparedTx.networkId
    }
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    const { data } = await axios.post(
      `${this.epochRPC}/v2/transactions`,
      { tx: rawTransaction },
      { headers: { 'Content-Type': 'application/json' } }
    )

    return data.tx_hash
  }

  private toHexBuffer(value: number | BigNumber): Buffer {
    const hexString: string = EthereumUtils.toHex(value).substr(2)

    return Buffer.from(padStart(hexString, hexString.length % 2 === 0 ? hexString.length : hexString.length + 1, '0'), 'hex')
  }

  public async signMessage(message: string, privateKey: Buffer): Promise<string> {
    return Promise.reject('Message signing not implemented')
  }

  public async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    return Promise.reject('Message verification not implemented')
  }
}
