import { PublicKey } from '@airgap/module-kit'
import { hash } from '@stablelib/blake2b'

import { encodeBase58 } from './encoding'
import { convertPublicKey } from './key'

export function tz1Address(publicKey: PublicKey): string {
  const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')
  const payload: Uint8Array = hash(Buffer.from(hexPublicKey.value, 'hex'), 20)

  return encodeBase58(payload, 'ed25519PublicKeyHash')
}
