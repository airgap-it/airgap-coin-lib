export abstract class CryptographyClient {
  public abstract async signMessage(message: string, keypair: { publicKey?: Buffer; privateKey?: Buffer }): Promise<string>
  public abstract async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean>

  public async recoverPublicKeyFromSignature(): Promise<void> {
    throw new Error(`Recovering public key from signature not supported`)
  }
}
