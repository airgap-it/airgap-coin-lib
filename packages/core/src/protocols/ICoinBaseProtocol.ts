import { CryptoClient, IAirGapTransaction } from '..'
import { IAirGapAddressResult, IProtocolAddressCursor } from '../interfaces/IAirGapAddress'
import { SignedTransaction } from '../types/signed-transaction'
import { UnsignedTransaction } from '../types/unsigned-transaction'
import { ProtocolOptions } from '../utils/ProtocolOptions'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

export interface FeeDefaults {
  low: string
  medium: string
  high: string
}

export interface ICoinBaseProtocol {
  /**
   * @deprecated Use `getSymbol()` instead.
   */
  symbol: string

  /**
   * @deprecated Use `getName()` instead.
   */
  name: string

  /**
   * @deprecated Use `getMarketSymbol()` instead.
   */
  marketSymbol: string

  /**
   * @deprecated Use `getFeeSymbol()` instead.
   */
  feeSymbol: string

  /**
   * @deprecated Use `getFeeDefaults()` instead.
   */
  feeDefaults: FeeDefaults

  /**
   * @deprecated Use `getDecimals()` instead.
   */
  decimals: number

  /**
   * @deprecated Use `getFeeDecimals()` instead.
   */
  feeDecimals: number

  /**
   * @deprecated Use `getIdentifier()` instead.
   */
  identifier: ProtocolSymbols

  /**
   * @deprecated Use `getUnits()` instead.
   */
  units: { unitSymbol: string; factor: string }[]

  /**
   * @deprecated Use `getSupportsHD()` instead.
   */
  supportsHD: boolean

  /**
   * @deprecated Use `getStandardDerivationPath()` instead.
   */
  standardDerivationPath: string

  /**
   * @deprecated Use `getAddressIsCaseSensitive()` instead.
   */
  addressIsCaseSensitive: boolean

  /**
   * @deprecated Use `getAddressValidationPattern()` instead.
   */
  addressValidationPattern: string

  /**
   * @deprecated Use `getAddressPlaceholder()` instead.
   */
  addressPlaceholder: string

  /**
   * @deprecated Use `getOptions()` instead.
   */
  options: ProtocolOptions

  cryptoClient: CryptoClient

  getSymbol(): Promise<string> // This will be used in the UI, eg. "ETH", "BTC", "AE"
  getName(): Promise<string> // Name of the currency, eg. "Bitcoin", "Aeternity"
  getMarketSymbol(): Promise<string> // Symbol that is most commonly used by other services such as coinmarketcap or cryptocompare.

  getFeeSymbol(): Promise<string>
  getFeeDefaults(): Promise<FeeDefaults>
  getDecimals(): Promise<number>
  getFeeDecimals(): Promise<number>
  getIdentifier(): Promise<ProtocolSymbols>

  getUnits(): Promise<{ unitSymbol: string; factor: string }[]>

  getSupportsHD(): Promise<boolean>
  getStandardDerivationPath(): Promise<string>

  getAddressIsCaseSensitive(): Promise<boolean>
  getAddressValidationPattern(): Promise<string>
  getAddressPlaceholder(): Promise<string>

  getOptions(): Promise<ProtocolOptions>

  getAddressFromPublicKey(publicKey: string, cursor?: IProtocolAddressCursor): Promise<IAirGapAddressResult>
  getAddressesFromPublicKey(publicKey: string, cursor?: IProtocolAddressCursor): Promise<IAirGapAddressResult[]> // broadcaster knows this (both broadcaster and signer)
  getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<IAirGapAddressResult> // broadcaster knows this (both broadcaster and signer)
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<IAirGapAddressResult[]> // broadcaster knows this (both broadcaster and signer)

  getTransactionDetails(transaction: UnsignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of unsigned transaction
  getTransactionDetailsFromSigned(transaction: SignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of signed transaction

  verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  encryptAsymmetric(payload: string, publicKey: string): Promise<string>
}
