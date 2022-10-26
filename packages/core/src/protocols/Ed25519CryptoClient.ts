import { concat } from '@stablelib/bytes'
import { BLAKE2b } from '@stablelib/blake2b'
import { convertPublicKeyToX25519, convertSecretKeyToX25519, KeyPair } from '@stablelib/ed25519'
import { box, generateKeyPair, openBox } from '@stablelib/nacl'
import { encode } from '@stablelib/utf8'

import { isHex } from '../utils/hex'

import { CryptoClient } from './CryptoClient'

function toHex(value: any): string {
  return Buffer.from(value).toString('hex')
}

export abstract class Ed25519CryptoClient extends CryptoClient {
  public async encryptAsymmetric(payload: string, publicKey: string): Promise<string> {
    const kxOtherPublicKey: Uint8Array = convertPublicKeyToX25519(Buffer.from(publicKey, 'hex'))

    const keypair: KeyPair = generateKeyPair()
    const state: BLAKE2b = new BLAKE2b(24)
    const nonce: Uint8Array = state.update(keypair.publicKey, 32).update(kxOtherPublicKey, 32).digest()

    const encryptedMessage: Uint8Array = box(
      kxOtherPublicKey,
      keypair.secretKey,
      nonce,
      isHex(payload) ? Buffer.from(payload, 'hex') : encode(payload)
    )

    return toHex(concat(keypair.publicKey, encryptedMessage))
  }

  public async decryptAsymmetric(encryptedPayload: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    const kxSelfPrivateKey: Uint8Array = convertSecretKeyToX25519(Buffer.from(keypair.privateKey, 'hex')) // Secret bytes to scalar bytes
    const kxSelfPublicKey: Uint8Array = convertPublicKeyToX25519(Buffer.from(keypair.publicKey, 'hex')) // Secret bytes to scalar bytes

    const encryptedPayloadBytes: Buffer = Buffer.from(encryptedPayload, isHex(encryptedPayload) ? 'hex' : 'utf-8')
    const kxOtherPublicKey: Buffer = encryptedPayloadBytes.slice(0, 32)
    const ciphertext: Buffer = encryptedPayloadBytes.slice(32)

    const state: BLAKE2b = new BLAKE2b(24)
    const nonce: Uint8Array = state.update(kxOtherPublicKey, 32).update(kxSelfPublicKey, 32).digest()

    const decryptedMessage: Uint8Array | null = openBox(kxOtherPublicKey, kxSelfPrivateKey, nonce, ciphertext)

    if (decryptedMessage === null) {
      throw new Error('Ed25519 decryption failed.')
    }

    return Buffer.from(decryptedMessage).toString()
  }
}
