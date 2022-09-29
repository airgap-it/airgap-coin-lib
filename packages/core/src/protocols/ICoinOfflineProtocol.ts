import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'
import { ICoinBaseProtocol } from './ICoinBaseProtocol'

export interface ICoinOfflineProtocol extends ICoinBaseProtocol {
  getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>
  getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer>

  getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string>

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer>

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any, childDerivationPath?: string): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation
  signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<IAirGapSignedTransaction> // broadcaster proxies this operation

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string>

  signMessage(message: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string> // Returns signature

  decryptAsymmetric(encryptedPayload: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string>

  encryptAES(payload: string, privateKey: Buffer): Promise<string>
  decryptAES(encryptedPayload: string, privateKey: Buffer): Promise<string>
}
