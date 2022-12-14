import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newPublicKey, newSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'

import { convertEncodedBytesString, convertHexBytesString } from './convert'

export function convertSecretKey(secretKey: SecretKey, targetFormat: SecretKey['format']): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey
  }

  switch (secretKey.format) {
    case 'encoded':
      return newSecretKey(convertEncodedBytesString('ed25519SecretKey', secretKey.value, targetFormat), targetFormat)
    case 'hex':
      return newSecretKey(convertHexBytesString('ed25519SecretKey', secretKey.value, targetFormat), targetFormat)
    default:
      assertNever(secretKey.format)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported secret key format.')
  }
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  switch (publicKey.format) {
    case 'encoded':
      return newPublicKey(convertEncodedBytesString('ed25519PublicKey', publicKey.value, targetFormat), targetFormat)
    case 'hex':
      return newPublicKey(convertHexBytesString('ed25519PublicKey', publicKey.value, targetFormat), targetFormat)
    default:
      assertNever(publicKey.format)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported public key format.')
  }
}
