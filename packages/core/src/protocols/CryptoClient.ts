import { NotImplementedError } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { AES } from '../utils/AES'

export abstract class CryptoClient {
  public abstract signMessage(message: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string>
  public abstract verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  public async encryptAES(payload: string, privateKey: Buffer): Promise<string> {
    return new AES().encryptString(payload, privateKey)
  }
  public async decryptAES(encryptedPayload: string, privateKey: Buffer): Promise<string> {
    return new AES().decryptString(encryptedPayload, privateKey)
  }

  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    throw new NotImplementedError(Domain.UTILS, `encryptAsymmetric() not Implemented`)
  }
  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string> {
    throw new NotImplementedError(Domain.UTILS, `decryptAsymmetric() not Implemented`)
  }

  public async recoverPublicKeyFromSignature(): Promise<void> {
    throw new NotImplementedError(Domain.UTILS, `Recovering public key from signature not supported`)
  }
}
