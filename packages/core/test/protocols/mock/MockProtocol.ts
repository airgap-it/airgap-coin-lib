import { hash } from '@stablelib/blake2b'

import { CryptoClient, SignedTransaction, UnsignedTransaction } from '../../../src'
import { IProtocolAddressCursor, IAirGapAddressResult } from '../../../src/interfaces/IAirGapAddress'
import {
  AirGapTransactionStatus,
  IAirGapTransaction,
  IAirGapTransactionResult,
  IProtocolTransactionCursor
} from '../../../src/interfaces/IAirGapTransaction'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../../../src/protocols/ICoinProtocol'
import { ICoinSubProtocol } from '../../../src/protocols/ICoinSubProtocol'
import { bytesToHex, isHex, toHexBuffer } from '../../../src/utils/hex'
import { ProtocolOptions } from '../../../src/utils/ProtocolOptions'
import { ProtocolSymbols } from '../../../src/utils/ProtocolSymbols'
import { MockCryptoClient } from './MockCryptoClient'
import { MockProtocolOptions } from './MockProtocolOptions'

export class MockProtocol implements ICoinProtocol {
  public symbol: string
  public name: string
  public marketSymbol: string

  public feeSymbol: string

  public feeDefaults: FeeDefaults

  public decimals: number
  public feeDecimals: number
  public identifier: ProtocolSymbols
  public units: CurrencyUnit[]

  public supportsHD: boolean

  public standardDerivationPath: string

  public addressIsCaseSensitive: boolean
  public addressValidationPattern: string

  public addressPlaceholder: string

  public readonly cryptoClient: CryptoClient

  constructor(public readonly options: MockProtocolOptions = new MockProtocolOptions()) {
    this.symbol = options.config.symbol ?? 'DEV'
    this.name = options.config.name ?? 'Dev'
    this.marketSymbol = options.config.marketSymbol ?? 'DEV'
    this.feeSymbol = options.config.feeSymbol ?? 'DEV'
    this.feeDefaults = options.config.feeDefaults ?? {
      low: '0.00002',
      medium: '0.00004',
      high: '0.00005'
    }
    this.decimals = options.config.decimals ?? 6
    this.feeDecimals = options.config.feeDecimals ?? 6
    this.identifier = options.config.identifier ?? ('_dev' as ProtocolSymbols)
    this.units = options.config.units ?? []
    this.supportsHD = options.config.supportsHD ?? false
    this.standardDerivationPath = options.config.standardDerivationPath ?? 'm/'
    this.addressIsCaseSensitive = options.config.addressIsCaseSensitive ?? false
    this.addressValidationPattern = options.config.addressValidationPattern ?? '.+'
    this.addressPlaceholder = options.config.addressPlaceholder ?? 'abc...'
    this.cryptoClient = options.config.cryptoClient ?? new MockCryptoClient()
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

  public async getFeeSymbol(): Promise<string> {
    return this.feeSymbol
  }

  public async getFeeDefaults(): Promise<FeeDefaults> {
    return this.feeDefaults
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

  public async getOptions(): Promise<ProtocolOptions> {
    return this.options
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult<IProtocolTransactionCursor>> {
    return { transactions: [], cursor: {} }
  }

  public async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor?: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult<IProtocolTransactionCursor>> {
    return { transactions: [], cursor: {} }
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult<IProtocolTransactionCursor>> {
    return { transactions: [], cursor: {} }
  }

  public async getBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfPublicKey(
    publicKey: string,
    data?: { [key: string]: unknown; addressIndex?: number | undefined }
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    data?: { [key: string]: unknown }
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getAvailableBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionStatuses(transactionHash: string[]): Promise<AirGapTransactionStatus[]> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  public async estimateMaxTransactionValueFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    fee?: string,
    data?: { [key: string]: unknown }
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    recipients: string[],
    fee?: string,
    data?: { [key: string]: unknown; addressIndex?: number | undefined }
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async estimateFeeDefaultsFromExtendedPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults> {
    throw new Error('Method not implemented.')
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults> {
    throw new Error('Method not implemented.')
  }

  public async prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> {
    throw new Error('Method not implemented.')
  }

  public async broadcastTransaction(rawTransaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: IProtocolAddressCursor): Promise<IAirGapAddressResult> {
    const publicKeyBuffer: Buffer = Buffer.from(publicKey, isHex(publicKey) ? 'hex' : 'utf-8')

    const address: Uint8Array = hash(publicKeyBuffer, 32)

    return {
      address: bytesToHex(address, { withPrefix: true }),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: IProtocolAddressCursor): Promise<IAirGapAddressResult[]> {
    return [await this.getAddressFromPublicKey(publicKey, cursor)]
  }

  public async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<IAirGapAddressResult> {
    console.log('xpub', extendedPublicKey, 'vdi', visibilityDerivationIndex, 'adi', addressDerivationIndex)

    const extendedPublicKeyBuffer = Buffer.from(extendedPublicKey, isHex(extendedPublicKey) ? 'hex' : 'utf-8')
    const visibilityDerivationIndexBuffer = toHexBuffer(visibilityDerivationIndex)
    const addressDerivationIndexBuffer = toHexBuffer(addressDerivationIndex)

    const address: Uint8Array = hash(
      Buffer.concat([extendedPublicKeyBuffer, visibilityDerivationIndexBuffer, addressDerivationIndexBuffer]),
      32
    )

    return {
      address: bytesToHex(address, { withPrefix: true }),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<IAirGapAddressResult[]> {
    const addressDerivationIndices = Array.from(new Array(addressCount), (_, i) => i + offset)

    return Promise.all(
      addressDerivationIndices.map((x) => this.getAddressFromExtendedPublicKey(extendedPublicKey, visibilityDerivationIndex, x))
    )
  }

  public async getTransactionDetails(transaction: UnsignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionDetailsFromSigned(
    transaction: SignedTransaction,
    data?: { [key: string]: unknown }
  ): Promise<IAirGapTransaction[]> {
    throw new Error('Method not implemented.')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any, childDerivationPath?: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async signWithPrivateKey(privateKey: string, transaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async signMessage(message: string, keypair: { publicKey?: string | undefined; privateKey: string }): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async decryptAsymmetric(
    encryptedPayload: string,
    keypair: { publicKey?: string | undefined; privateKey: string }
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async encryptAES(payload: string, privateKey: string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async decryptAES(encryptedPayload: string, privateKey: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
