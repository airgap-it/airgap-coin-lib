export abstract class CryptoClient {
  public abstract async signMessage(message: string, keypair: { publicKey?: string; privateKey: Buffer }): Promise<string>
  public abstract async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean>

  public async recoverPublicKeyFromSignature(): Promise<void> {
    throw new Error(`Recovering public key from signature not supported`)
  }
}
