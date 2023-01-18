import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newPublicKey, newSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'

import { convertEncodedBytesString, convertHexBytesString } from './convert'
import { BASE58_PREFIX } from './encoding'

export function convertSecretKey(
  secretKey: SecretKey,
  targetFormat: SecretKey['format'],
  type: Extract<
    keyof typeof BASE58_PREFIX,
    'ed25519SecretKey' | 'secp256K1SecretKey' | 'p256SecretKey' | 'saplingSpendingKey'
  > = 'ed25519SecretKey'
): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey
  }

  switch (secretKey.format) {
    case 'encoded':
      return newSecretKey(convertEncodedBytesString(type, secretKey.value, targetFormat), targetFormat)
    case 'hex':
      return newSecretKey(convertHexBytesString(type, secretKey.value, targetFormat), targetFormat)
    default:
      assertNever(secretKey.format)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported secret key format.')
  }
}

export function convertPublicKey(
  publicKey: PublicKey,
  targetFormat: PublicKey['format'],
  type:
    | Extract<keyof typeof BASE58_PREFIX, 'ed25519PublicKey' | 'secp256K1PublicKey' | 'p256PublicKey'>
    | 'saplingViewingKey' = 'ed25519PublicKey'
): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  if (type === 'saplingViewingKey') {
    throw new UnsupportedError(Domain.TEZOS, `Conversion for ${type} is not supported.`)
  }

  switch (publicKey.format) {
    case 'encoded':
      return newPublicKey(convertEncodedBytesString(type, publicKey.value, targetFormat), targetFormat)
    case 'hex':
      return newPublicKey(convertHexBytesString(type, publicKey.value, targetFormat), targetFormat)
    default:
      assertNever(publicKey.format)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported public key format.')
  }
}
