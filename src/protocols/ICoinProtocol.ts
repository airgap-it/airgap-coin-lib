import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../serializer/schemas/definitions/transaction-sign-request'
import { SignedTransaction } from '../serializer/schemas/definitions/transaction-sign-response'
import { ProtocolOptions } from '../utils/ProtocolOptions'

import { ICoinSubProtocol } from './ICoinSubProtocol'

export interface FeeDefaults {
  low: string
  medium: string
  high: string
}

export interface CurrencyUnit {
  unitSymbol: string
  factor: string
}

export interface ICoinProtocol {
  symbol: string // This will be used in the UI, eg. "ETH", "BTC", "AE"
  name: string // Name of the currency, eg. "Bitcoin", "Aeternity"
  marketSymbol: string // Symbol that is most commonly used by other services such as coinmarketcap or cryptocompare.

  feeSymbol: string
  feeDefaults: FeeDefaults
  decimals: number
  feeDecimals: number
  identifier: string

  units: { unitSymbol: string; factor: string }[]

  supportsHD: boolean
  standardDerivationPath: string

  addressIsCaseSensitive: boolean
  addressValidationPattern: string
  addressPlaceholder: string

  // can have sub-protocols defined
  subProtocols?: (ICoinProtocol & ICoinSubProtocol)[]

  options: ProtocolOptions

  getBlockExplorerLinkForAddress(address: string): Promise<string>
  getBlockExplorerLinkForTxId(txId: string): Promise<string>

  getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>
  getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer>

  getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer>

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>

  getAddressFromPublicKey(publicKey: string): Promise<string>
  getAddressesFromPublicKey(publicKey: string): Promise<string[]> // broadcaster knows this (both broadcaster and signer)
  getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<string> // broadcaster knows this (both broadcaster and signer)
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> // broadcaster knows this (both broadcaster and signer)

  getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  getTransactionDetails(transaction: UnsignedTransaction): Promise<IAirGapTransaction[]> // out of unsigned transaction
  getTransactionDetailsFromSigned(transaction: SignedTransaction): Promise<IAirGapTransaction[]> // out of signed transaction

  getBalanceOfAddresses(addresses: string[]): Promise<string>
  getBalanceOfPublicKey(publicKey: string): Promise<string>
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<string>
  getAvailableBalanceOfAddresses(addresses: string[]): Promise<string>
  getTransactionStatuses(transactionHash: string[]): Promise<AirGapTransactionStatus[]>

  estimateMaxTransactionValueFromExtendedPublicKey(extendedPublicKey: string, recipients: string[], fee?: string): Promise<string>
  estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string>

  estimateFeeDefaultsFromExtendedPublicKey(publicKey: string, recipients: string[], values: string[], data?: any): Promise<FeeDefaults>
  estimateFeeDefaultsFromPublicKey(publicKey: string, recipients: string[], values: string[], data?: any): Promise<FeeDefaults>

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    data?: any
  ): Promise<any> // only broadcaster
  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: string[], fee: string, data?: any): Promise<any> // only broadcaster
  broadcastTransaction(rawTransaction: any): Promise<string>

  signMessage(message: string, privateKey: Buffer): Promise<string> // Returns signature
  verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean>
}
