import { CryptoClient } from '..'
import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction, IAirGapTransactionResult } from '../interfaces/IAirGapTransaction'
import { SignedTransaction } from '../serializer/schemas/definitions/signed-transaction'
import { UnsignedTransaction } from '../serializer/schemas/definitions/unsigned-transaction'
import { ProtocolOptions } from '../utils/ProtocolOptions'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

import { IProtocolTransactionCursor } from './../interfaces/IAirGapTransaction'
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

export interface CoinAddress {
  getValue(): string
}

export interface ICoinProtocol {
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

  getBlockExplorerLinkForAddress(address: string): Promise<string>
  getBlockExplorerLinkForTxId(txId: string): Promise<string>

  getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>
  getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer>

  getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer>

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>

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

  getTransactionsFromPublicKey(publicKey: string, limit: number, cursor?: IProtocolTransactionCursor): Promise<IAirGapTransactionResult>
  getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor?: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult>
  getTransactionsFromAddresses(addresses: string[], limit: number, cursor?: IProtocolTransactionCursor): Promise<IAirGapTransactionResult>

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  getTransactionDetails(transaction: UnsignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of unsigned transaction
  getTransactionDetailsFromSigned(transaction: SignedTransaction, data?: { [key: string]: unknown }): Promise<IAirGapTransaction[]> // out of signed transaction

  getBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string>
  getBalanceOfPublicKey(publicKey: string, data?: { addressIndex?: number; [key: string]: unknown }): Promise<string>
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number, data?: { [key: string]: unknown }): Promise<string>
  getAvailableBalanceOfAddresses(addresses: string[], data?: { [key: string]: unknown }): Promise<string>
  getTransactionStatuses(transactionHash: string[]): Promise<AirGapTransactionStatus[]>
  getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]>

  estimateMaxTransactionValueFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    fee?: string,
    data?: { [key: string]: unknown }
  ): Promise<string>
  estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    recipients: string[],
    fee?: string,
    data?: { addressIndex?: number; [key: string]: unknown }
  ): Promise<string>

  estimateFeeDefaultsFromExtendedPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults>
  estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: { [key: string]: unknown }
  ): Promise<FeeDefaults>

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> // only broadcaster
  prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    extras?: { [key: string]: unknown }
  ): Promise<any> // only broadcaster
  broadcastTransaction(rawTransaction: any): Promise<string>

  signMessage(message: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string> // Returns signature
  verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  encryptAsymmetric(payload: string, publicKey: string): Promise<string>
  decryptAsymmetric(encryptedPayload: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string>

  encryptAES(payload: string, privateKey: Buffer): Promise<string>
  decryptAES(encryptedPayload: string, privateKey: Buffer): Promise<string>
}
