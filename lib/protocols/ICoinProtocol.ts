import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import BigNumber from 'bignumber.js'
import { UnsignedTransaction } from './../serializer/unsigned-transaction.serializer'
import { SignedTransaction } from '../serializer/signed-transaction.serializer'
import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'
import { ICoinSubProtocol } from './ICoinSubProtocol'

export interface ICoinProtocol {
  symbol: string // This will be used in the UI, eg. "ETH", "BTC", "AE"
  name: string // Name of the currency, eg. "Bitcoin", "Aeternity"
  marketSymbol: string // Symbol that is most commonly used by other services such as coinmarketcap or cryptocompare.

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
  addressPlaceholder: string

  blockExplorer: string

  // can have sub-protocols defined
  subProtocols?: (ICoinProtocol & ICoinSubProtocol)[]

  getBlockExplorerLinkForAddress(address: string): string
  getBlockExplorerLinkForTxId(txId: string): string

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string
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
  getTransactionDetails(transaction: UnsignedTransaction): Promise<IAirGapTransaction> // out of unsigned transaction
  getTransactionDetailsFromSigned(transaction: SignedTransaction): Promise<IAirGapTransaction> // out of signed transaction

  getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>
  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber>

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: any
  ): Promise<any> // only broadcaster
  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber, data?: any): Promise<any> // only broadcaster
  broadcastTransaction(rawTransaction: any): Promise<string>
}
