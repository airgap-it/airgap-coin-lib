import { decrypt, encrypt } from '../dependencies/src/eciesjs-0.3.9/src/index'

import { CryptoClient } from './CryptoClient'

export abstract class Secp256k1CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    return encrypt(publicKey, Buffer.from(payload)).toString('hex')
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    return decrypt(keypair.privateKey, Buffer.from(encryptedPayload, 'hex')).toString()
  }
}
