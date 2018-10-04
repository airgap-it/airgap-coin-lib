/// <reference types="node" />
import { ICoinProtocol } from './ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '..'
export declare class AEProtocol implements ICoinProtocol {
  private epochRPC
  symbol: string
  name: string
  feeSymbol: string
  decimals: number
  feeDecimals: number
  identifier: string
  feeDefaults: {
    low: BigNumber
    medium: BigNumber
    high: BigNumber
  }
  units: {
    unitSymbol: string
    factor: BigNumber
  }[]
  supportsHD: boolean
  standardDerivationPath: string
  addressValidationPattern: string
  constructor(epochRPC?: string)
  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string
  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer
  /**
   * Currently, the AE Address is just the Public Key. Address Format tbd
   */
  getAddressFromPublicKey(publicKey: string): string
  getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]>
  signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<string>
  getTransactionDetails(transaction: any): IAirGapTransaction
  getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction
  getBalanceOfAddresses(addresses: string[]): Promise<BigNumber>
  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber>
  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any>
  broadcastTransaction(rawTransaction: string): Promise<any>
  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string
  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber>
  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string>
  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): string[]
  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]>
  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<any>
}
