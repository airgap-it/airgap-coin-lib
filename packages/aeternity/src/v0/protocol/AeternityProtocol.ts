import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { generateWalletUsingDerivationPath } from '@airgap/coinlib-core/dependencies/src/hd-wallet-js-b216450e56954a6e82ace0aade9474673de5d9d5/src/index'
import * as rlp from '@airgap/coinlib-core/dependencies/src/rlp-2.2.3/index'
import { BalanceError, InvalidValueError, NetworkError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { IAirGapSignedTransaction } from '@airgap/coinlib-core/interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { ICoinSubProtocol } from '@airgap/coinlib-core/protocols/ICoinSubProtocol'
import { NonExtendedProtocol } from '@airgap/coinlib-core/protocols/NonExtendedProtocol'
import bs64check from '@airgap/coinlib-core/utils/base64Check'
import { toHexBuffer } from '@airgap/coinlib-core/utils/hex'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { sign } from '@stablelib/ed25519'

import { SignedAeternityTransaction } from '../types/signed-transaction-aeternity'
import { RawAeternityTransaction } from '../types/transaction-aeternity'
import { UnsignedAeternityTransaction } from '../types/unsigned-transaction-aeternity'

import { AeternityAddress } from './AeternityAddress'
import { AeternityCryptoClient } from './AeternityCryptoClient'
import { AeternityProtocolOptions } from './AeternityProtocolOptions'
import { AeternityAddressCursor, AeternityAddressResult, AeternityTransactionCursor, AeternityTransactionResult } from './AeternityTypes'

export class AeternityProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = 'AE'
  public name: string = 'æternity'
  public marketSymbol: string = 'ae'

  public feeSymbol: string = 'ae'

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: ProtocolSymbols = MainProtocolSymbols.AE

  public feeDefaults: FeeDefaults = {
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
  public addressValidationPattern: string = '^ak_+[1-9A-Za-z]{38,50}$'
  public addressPlaceholder: string = 'ak_abc...'

  // ae specifics
  public defaultNetworkId: string = 'ae_mainnet'

  private readonly feesURL: string = 'https://api-airgap.gke.papers.tech/fees'

  public readonly cryptoClient: AeternityCryptoClient = new AeternityCryptoClient()

  constructor(public readonly options: AeternityProtocolOptions = new AeternityProtocolOptions()) {
    super()
  }

  public async getSymbol(): Promise<string> {
    return this.symbol
  }

  public async getName(): Promise<string> {
    return this.name
  }

  public async getMarketSymbol(): Promise<string> {
    return this.marketSymbol
  }

  public async getAssetSymbol(): Promise<string | undefined> {
    return undefined
  }

  public async getFeeSymbol(): Promise<string> {
    return this.feeSymbol
  }

  public async getDecimals(): Promise<number> {
    return this.decimals
  }

  public async getFeeDecimals(): Promise<number> {
    return this.feeDecimals
  }

  public async getIdentifier(): Promise<ProtocolSymbols> {
    return this.identifier
  }

  public async getFeeDefaults(): Promise<FeeDefaults> {
    return this.feeDefaults
  }

  public async getUnits(): Promise<CurrencyUnit[]> {
    return this.units
  }

  public async getSupportsHD(): Promise<boolean> {
    return this.supportsHD
  }

  public async getStandardDerivationPath(): Promise<string> {
    return this.standardDerivationPath
  }

  public async getAddressIsCaseSensitive(): Promise<boolean> {
    return this.addressIsCaseSensitive
  }

  public async getAddressValidationPattern(): Promise<string> {
    return this.addressValidationPattern
  }

  public async getAddressPlaceholder(): Promise<string> {
    return this.addressPlaceholder
  }

  public async getOptions(): Promise<AeternityProtocolOptions> {
    return this.options
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

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
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
  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return Buffer.from(secretKey).toString('hex')
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: AeternityAddressCursor): Promise<AeternityAddressResult> {
    return {
      address: AeternityAddress.from(publicKey).asString(),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: AeternityAddressCursor): Promise<AeternityAddressResult[]> {
    const address = await this.getAddressFromPublicKey(publicKey, cursor)

    return [address]
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AeternityTransactionResult> {
    const address: AeternityAddressResult = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses([address.address], limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AeternityTransactionResult> {
    const groupedTransactions = await Promise.all(
      addresses.map(async (address) => {
        const endpoint = cursor === undefined ? `/txs/backward?account=${address}&limit=${limit}` : cursor.next[address]
        const url = endpoint !== undefined ? `${this.options.network.rpcUrl}/mdw/${endpoint.replace(/^\/+/, '')}` : undefined
        const response = url !== undefined ? await axios.get(url) : undefined

        return {
          address,
          data: response?.data
        }
      })
    )

    const [next, allTransactions] = groupedTransactions.reduce(
      (acc, curr) => {
        const nextAcc = curr.data?.next ? Object.assign(acc[0], { [curr.address]: curr.data.next }) : acc[0]
        const transactionsAcc = acc[1].concat(curr.data?.data || [])

        return [nextAcc, transactionsAcc]
      },
      [{}, [] as any[]]
    )

    const transactions = allTransactions.map((obj) => {
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

    return { transactions, cursor: { next } }
  }

  protected getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 1
    }

    return 1 + Math.floor(offset / limit) // We need +1 here because pages start at 1
  }

  public async signWithPrivateKey(privateKey: string, transaction: RawAeternityTransaction): Promise<IAirGapSignedTransaction> {
    // sign and cut off first byte ('ae')
    const rawTx = this.decodeTx(transaction.transaction)

    const signature = sign(Buffer.from(privateKey, 'hex'), Buffer.concat([Buffer.from(transaction.networkId), rawTx]))
    const txObj = {
      tag: toHexBuffer(11),
      version: toHexBuffer(1),
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

    const fromAddress: AeternityAddressResult = await this.getAddressFromPublicKey(rlpDecodedTx[2].slice(1).toString('hex'))
    const toAddress: AeternityAddressResult = await this.getAddressFromPublicKey(rlpDecodedTx[3].slice(1).toString('hex'))

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)).toString(10),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)).toString(10),
      from: [fromAddress.address],
      isInbound: false,
      protocolIdentifier: this.identifier,
      network: this.options.network,
      to: [toAddress.address],
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
    const address: AeternityAddressResult = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.address])
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

    const address: AeternityAddressResult = await this.getAddressFromPublicKey(publicKey)

    try {
      const { data: accountResponse } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address.address}`)
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
      tag: toHexBuffer(12),
      version: toHexBuffer(1),
      sender_id: Buffer.concat([toHexBuffer(1), Buffer.from(sender, 'hex')]),
      recipient_id: Buffer.concat([toHexBuffer(1), recipient]),
      amount: toHexBuffer(new BigNumber(values[0])),
      fee: toHexBuffer(new BigNumber(fee)),
      ttl: toHexBuffer(0),
      nonce: toHexBuffer(nonce),
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

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    return this.cryptoClient.signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.cryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptAsymmetric(message: string, publicKey: string): Promise<string> {
    return this.cryptoClient.encryptAsymmetric(message, publicKey)
  }

  public async decryptAsymmetric(message: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    return this.cryptoClient.decryptAsymmetric(message, keypair)
  }

  public async encryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.encryptAES(message, privateKey)
  }

  public async decryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.decryptAES(message, privateKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    return Promise.reject('Transaction status not implemented')
  }
}
