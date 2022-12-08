import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { PublicKey, SecretKey } from '@airgap/module-kit'

export function convertSecretKey(secretKey: SecretKey, targetFormat: SecretKey['format']): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey
  }

  throw new UnsupportedError(Domain.COSMOS, 'Unsupported secret key conversion.')
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  throw new UnsupportedError(Domain.COSMOS, 'Unsupported public key conversion.')
}
