import * as sodium from 'libsodium-wrappers'

import axios, { AxiosError } from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '../../dependencies/src/bip39-2.5.0/index'
import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import { generateWalletUsingDerivationPath } from '../../dependencies/src/hd-wallet-js-b216450e56954a6e82ace0aade9474673de5d9d5/src/index'
import * as rlp from '../../dependencies/src/rlp-2.2.3/index'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SignedAeternityTransaction } from '../../serializer/schemas/definitions/signed-transaction-aeternity'
import { UnsignedAeternityTransaction } from '../../serializer/schemas/definitions/unsigned-transaction-aeternity'
import { RawAeternityTransaction } from '../../serializer/types'
import bs64check from '../../utils/base64Check'
import { padStart } from '../../utils/padStart'
import { MainProtocolSymbols, ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { EthereumUtils } from '../ethereum/utils/utils'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

import { AeternityTransactionCursor, AeternityTransactionResult } from './AeternityTypes'
import { AeternityAddress } from './AeternityAddress'
import { AeternityCryptoClient } from './AeternityCryptoClient'
import { AeternityProtocolOptions } from './AeternityProtocolOptions'
import { BalanceError, InvalidValueError, NetworkError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'

export class AeternityProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = 'AE'
  public name: string = 'æternity'
  public marketSymbol: string = 'ae'

  public feeSymbol: string = 'ae'

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: ProtocolSymbols = MainProtocolSymbols.AE

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

  // ae specifics
  public defaultNetworkId: string = 'ae_mainnet'

  private readonly feesURL: string = 'https://api-airgap.gke.papers.tech/fees'

  public readonly cryptoClient: AeternityCryptoClient = new AeternityCryptoClient()

  constructor(public readonly options: AeternityProtocolOptions = new AeternityProtocolOptions()) {
    super()
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
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

  public async getAddressFromPublicKey(publicKey: string): Promise<AeternityAddress> {
    return AeternityAddress.from(publicKey)
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<AeternityAddress[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return [address]
  }

  public async getNextAddressFromPublicKey(publicKey: string, current: AeternityAddress): Promise<AeternityAddress> {
    return current
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AeternityTransactionResult> {
    const address: AeternityAddress = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses([address.getValue()], limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AeternityTransactionResult> {
    const allTransactions = await Promise.all(
      addresses.map((address) => {
        const url = cursor
          ? `${this.options.network.rpcUrl}/mdw/txs/backward?account=${address}&page=${cursor.page}&limit=${limit}`
          : `${this.options.network.rpcUrl}/mdw/txs/backward?account=${address}&page=1&limit=${limit}`
        return axios.get(url)
      })
    )

    let transactions: any[] = [].concat(
      ...allTransactions.map((axiosData) => {
        return axiosData.data.data || []
      })
    )
    transactions = transactions.map((obj) => {
      const parsedTimestamp = parseInt(obj.micro_time, 10)
      const airGapTx: IAirGapTransaction = {
        amount: new BigNumber(obj.tx.amount).toString(10),
        fee: new BigNumber(obj.tx.fee).toString(10),
        from: [obj.tx.sender_id],
        isInbound: addresses.indexOf(obj.tx.recipient_id) !== -1,
        protocolIdentifier: this.identifier,
        network: this.options.network,
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

    return { transactions, cursor: { page: cursor ? cursor.page + 1 : 2 } }
  }

  protected getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 1
    }

    return 1 + Math.floor(offset / limit) // We need +1 here because pages start at 1
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

    const txArray = Object.keys(txObj).map((a) => txObj[a])

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

    throw new InvalidValueError(Domain.AETERNITY, 'invalid TX-encoding')
  }

  public async getTransactionDetails(unsignedTx: UnsignedAeternityTransaction): Promise<IAirGapTransaction[]> {
    const transaction = unsignedTx.transaction.transaction
    const rlpEncodedTx = this.decodeTx(transaction)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

    const fromAddress: AeternityAddress = await this.getAddressFromPublicKey(rlpDecodedTx[2].slice(1).toString('hex'))
    const toAddress: AeternityAddress = await this.getAddressFromPublicKey(rlpDecodedTx[3].slice(1).toString('hex'))

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)).toString(10),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)).toString(10),
      from: [fromAddress.getValue()],
      isInbound: false,
      protocolIdentifier: this.identifier,
      network: this.options.network,
      to: [toAddress.getValue()],
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
        const { data } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address}`)
        balance = balance.plus(new BigNumber(data.balance))
      } catch (error) {
        // if node returns 404 (which means 'no account found'), go with 0 balance
        if (error.response && error.response.status !== 404) {
          throw new NetworkError(Domain.AETERNITY, error as AxiosError)
        }
      }
    }

    return balance.toString(10)
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: AeternityAddress = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.getValue()])
  }

  public async getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]> {
    throw Promise.reject('get balance of sub protocols not supported')
  }

  public async getAvailableBalanceOfAddresses(addresses: string[]): Promise<string> {
    return this.getBalanceOfAddresses(addresses)
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceWrapper = new BigNumber(balance)

    let maxFee: BigNumber
    if (fee !== undefined) {
      maxFee = new BigNumber(fee)
    } else {
      const estimatedFeeDefaults = await this.estimateFeeDefaultsFromPublicKey(publicKey, recipients, [balance])
      maxFee = new BigNumber(estimatedFeeDefaults.medium).shiftedBy(this.decimals)
      if (maxFee.gte(balanceWrapper)) {
        maxFee = new BigNumber(0)
      }
    }

    let amountWithoutFees = balanceWrapper.minus(maxFee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return amountWithoutFees.toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    return (await axios.get(this.feesURL)).data
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { payload?: string }
  ): Promise<RawAeternityTransaction> {
    let nonce = 1

    const address: AeternityAddress = await this.getAddressFromPublicKey(publicKey)

    try {
      const { data: accountResponse } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address.getValue()}`)
      nonce = accountResponse.nonce + 1
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with nonce 0
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.AETERNITY, error as AxiosError)
      }
    }

    const balance: BigNumber = new BigNumber(await this.getBalanceOfPublicKey(publicKey))

    if (balance.isLessThan(fee)) {
      throw new BalanceError(Domain.AETERNITY, 'not enough balance')
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
      payload: Buffer.from(data?.payload || '')
    }

    const txArray = Object.keys(txObj).map((a) => txObj[a])
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
      `${this.options.network.rpcUrl}/v2/transactions`,
      { tx: rawTransaction },
      { headers: { 'Content-Type': 'application/json' } }
    )

    return data.tx_hash
  }

  private toHexBuffer(value: number | BigNumber): Buffer {
    const hexString: string = EthereumUtils.toHex(value).substr(2)

    return Buffer.from(padStart(hexString, hexString.length % 2 === 0 ? hexString.length : hexString.length + 1, '0'), 'hex')
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    return this.cryptoClient.signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.cryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptAsymmetric(message: string, publicKey: string): Promise<string> {
    return this.cryptoClient.encryptAsymmetric(message, publicKey)
  }

  public async decryptAsymmetric(message: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
    return this.cryptoClient.decryptAsymmetric(message, keypair)
  }

  public async encryptAES(message: string, privateKey: Buffer): Promise<string> {
    return this.cryptoClient.encryptAES(message, privateKey)
  }

  public async decryptAES(message: string, privateKey: Buffer): Promise<string> {
    return this.cryptoClient.decryptAES(message, privateKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    return Promise.reject('Transaction status not implemented')
  }
}
