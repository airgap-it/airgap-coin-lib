import { AES } from '../utils/AES'

export abstract class CryptoClient {
  public abstract async signMessage(message: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string>
  public abstract async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  public async encryptAES(payload: string, privateKey: Buffer): Promise<string> {
    return new AES().encryptString(payload, privateKey)
  }
  public async decryptAES(encryptedPayload: string, privateKey: Buffer): Promise<string> {
    return new AES().decryptString(encryptedPayload, privateKey)
  }

  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    throw new Error(`not Implemented`)
  }
  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string> {
    throw new Error(`not Implemented`)
  }

  public async recoverPublicKeyFromSignature(): Promise<void> {
    throw new Error(`Recovering public key from signature not supported`)
  }
}
