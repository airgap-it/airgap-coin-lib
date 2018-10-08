import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import BigNumber from 'bignumber.js'

export interface ICoinProtocol {
  symbol: string // This will be used in the UI, eg. "ETH", "BTC", "AE"
  name: string // Name of the currency, eg. "Bitcoin", "Aeternity"

  feeSymbol: string
  feeDefaults: {
    // This should be replaced with fees from an API
    low: BigNumber
    medium: BigNumber
    high: BigNumber
  }
  decimals: number
  feeDecimals: number
  identifier: string

  units: Array<{ unitSymbol: string; factor: BigNumber }>

  supportsHD: boolean
  standardDerivationPath: string

  addressValidationPattern: string

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string
  getAddressFromPublicKey(publicKey: string): string // broadcaster knows this (both broadcaster and signer)
  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string // broadcaster knows this (both broadcaster and signer)
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): string[] // broadcaster knows this (both broadcaster and signer)

  getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> // broadcaster proxies this operation
  signWithPrivateKey(extendedPrivateKey: Buffer, transaction: any): Promise<string> // broadcaster proxies this operation
  getTransactionDetails(transaction: any): IAirGapTransaction // out of public information (both broadcaster and signer)
  getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction // out of raw TX

  getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>
  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber>

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<any> // only broadcaster
  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any> // only broadcaster

  broadcastTransaction(rawTransaction: string): Promise<any>
}
