import { CryptoClient } from './CryptoClient'

export abstract class Sr25519CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    // Currently not supported: https://github.com/polkadot-js/common/issues/633
    throw new Error(`Method not implemented.`)
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
    // Currently not supported: https://github.com/polkadot-js/common/issues/633
    throw new Error(`Method not implemented.`)
  }
}
