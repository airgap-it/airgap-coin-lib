import { CryptoClient, IAirGapTransaction } from '..'
import { ProtocolOptions } from '../utils/ProtocolOptions'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

import { SignedTransaction } from '../serializer/schemas/definitions/signed-transaction'
import { UnsignedTransaction } from '../serializer/schemas/definitions/unsigned-transaction'

import { ICoinSubProtocol } from './ICoinSubProtocol'

export interface FeeDefaults {
  low: string
  medium: string
  high: string
}

export interface CoinAddress {
  getValue(): string
}

export interface ICoinBaseProtocol {
  symbol: string // This will be used in the UI, eg. "ETH", "BTC", "AE"
  name: string // Name of the currency, eg. "Bitcoin", "Aeternity"
  marketSymbol: string // Symbol that is most commonly used by other services such as coinmarketcap or cryptocompare.

  feeSymbol: string
  feeDefaults: FeeDefaults
  decimals: number
  feeDecimals: number
  identifier: ProtocolSymbols

  units: { unitSymbol: string; factor: string }[]

  supportsHD: boolean
  standardDerivationPath: string

  addressIsCaseSensitive: boolean
  addressValidationPattern: string
  addressPlaceholder: string

  // can have sub-protocols defined
  subProtocols?: ICoinSubProtocol[]

  options: ProtocolOptions

  cryptoClient: CryptoClient

  getAddressFromPublicKey(publicKey: string): Promise<CoinAddress>
  getAddressesFromPublicKey(publicKey: string): Promise<CoinAddress[]> // broadcaster knows this (both broadcaster and signer)
  getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<CoinAddress> // broadcaster knows this (both broadcaster and signer)
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<CoinAddress[]> // broadcaster knows this (both broadcaster and signer)
  getNextAddressFromPublicKey(publicKey: string, current: CoinAddress): Promise<CoinAddress>

  getTransactionDetails(transaction: UnsignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of unsigned transaction
  getTransactionDetailsFromSigned(transaction: SignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of signed transaction

  verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  encryptAsymmetric(payload: string, publicKey: string): Promise<string>
}
