import { decrypt, encrypt } from 'eciesjs'

import { CryptoClient } from './CryptoClient'

export abstract class Secp256k1CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    return encrypt(publicKey, Buffer.from(payload)).toString('hex')
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
    return decrypt(keypair.privateKey.toString('hex'), Buffer.from(encryptedPayload, 'hex')).toString()
  }
}
