import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { newPublicKey, newSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'
import Client from 'mina-signer'

export function finalizeSecretKey(rawSecretKey: Buffer): SecretKey {
  rawSecretKey[0] &= 0x3f
  const secretKey: Buffer = Buffer.concat([Buffer.from('5a01', 'hex'), rawSecretKey.reverse()])

  return newSecretKey(bs58check.encode(secretKey), 'encoded')
}

export function derivePublicKey(client: Client, secretKey: SecretKey): PublicKey {
  const publicKey = client.derivePublicKey(secretKey.value)

  return newPublicKey(publicKey, 'encoded')
}
