import { CryptoClient } from '@airgap/coinlib-core'

export class MockCryptoClient extends CryptoClient {
  public async signMessage(message: string, keypair: { publicKey?: string | undefined; privateKey: string }): Promise<string> {
    throw new Error('Method not implemented.')
  }
  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}
