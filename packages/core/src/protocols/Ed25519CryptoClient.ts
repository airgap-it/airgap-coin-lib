import * as sodium from 'libsodium-wrappers'

import { CryptoClient } from './CryptoClient'

function toHex(value: any): string {
  return Buffer.from(value).toString('hex')
}

export abstract class Ed25519CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    await sodium.ready

    const kxSelfPublicKey: Uint8Array = sodium.crypto_sign_ed25519_pk_to_curve25519(Buffer.from(publicKey, 'hex')) // Secret bytes to scalar bytes
    const encryptedMessage: Uint8Array = sodium.crypto_box_seal(payload, kxSelfPublicKey)

    return toHex(encryptedMessage)
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: Buffer }): Promise<string> {
    const kxSelfPrivateKey: Uint8Array = sodium.crypto_sign_ed25519_sk_to_curve25519(Buffer.from(keypair.privateKey)) // Secret bytes to scalar bytes
    const kxSelfPublicKey: Uint8Array = sodium.crypto_sign_ed25519_pk_to_curve25519(Buffer.from(keypair.publicKey, 'hex')) // Secret bytes to scalar bytes

    const decryptedMessage: Uint8Array = sodium.crypto_box_seal_open(
      Buffer.from(encryptedPayload, 'hex'),
      kxSelfPublicKey,
      kxSelfPrivateKey
    )

    return Buffer.from(decryptedMessage).toString()
  }
}
