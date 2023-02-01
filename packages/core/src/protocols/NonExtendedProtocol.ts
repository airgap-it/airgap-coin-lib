import { IAirGapAddressResult } from '../interfaces/IAirGapAddress'
import { IAirGapTransactionResult, IProtocolTransactionCursor } from '../interfaces/IAirGapTransaction'

import { FeeDefaults } from './ICoinProtocol'

export abstract class NonExtendedProtocol {
  public getExtendedPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw Promise.reject('extended public key support not implemented')
  }

  public getExtendedPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw Promise.reject('extended public key support not implemented')
  }

  public getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    throw Promise.reject('extended private key support not implemented')
  }

  public getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    throw Promise.reject('extended private key support not implemented')
  }

  public getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<string> {
    return Promise.reject('extended public balance not implemented')
  }

  public signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any, childDerivationPath: string): Promise<string> {
    return Promise.reject('extended private key signing for not implemented')
  }

  public getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<IAirGapAddressResult> {
    return Promise.resolve({
      address: '',
      cursor: { hasNext: false }
    })
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<IAirGapAddressResult[]> {
    return Promise.resolve([])
  }

  public estimateMaxTransactionValueFromExtendedPublicKey(extendedPublicKey: string, recipients: string[], fee: string): Promise<string> {
    return Promise.reject('estimating max value using extended public key not implemented')
  }

  public estimateFeeDefaultsFromExtendedPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    return Promise.reject('estimating fee defaults using extended public key not implemented')
  }

  public getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor: IProtocolTransactionCursor
  ): Promise<IAirGapTransactionResult> {
    return Promise.reject('fetching txs using extended public key not implemented')
  }

  public prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<any> {
    return Promise.reject('extended public key tx not implemented')
  }
}
