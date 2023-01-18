import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'
import { ICoinBaseProtocol } from './ICoinBaseProtocol'

export interface ICoinOfflineProtocol extends ICoinBaseProtocol {
  getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>
  getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>

  getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any, childDerivationPath?: string): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  signWithPrivateKey(privateKey: string, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>

  signMessage(message: string, keypair: { publicKey?: string; privateKey: string }): Promise<string> // Returns signature

  decryptAsymmetric(encryptedPayload: string, keypair: { publicKey?: string; privateKey: string }): Promise<string>

  encryptAES(payload: string, privateKey: string): Promise<string>
  decryptAES(encryptedPayload: string, privateKey: string): Promise<string>
}
