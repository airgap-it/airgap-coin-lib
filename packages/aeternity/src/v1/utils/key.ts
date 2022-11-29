import { assertNever, Domain } from '@airgap/coinlib-core'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { newPublicKey, PublicKey } from '@airgap/module-kit'

import { convertEncodedBytesString, convertHexBytesString } from './convert'

const PK_PREFIX: string = 'ak_'

export function aePublicKey(publicKey: string): PublicKey {
  const format: PublicKey['format'] | undefined = isHex(publicKey) ? 'hex' : publicKey.startsWith(PK_PREFIX) ? 'encoded' : undefined

  if (format === undefined) {
    throw new ConditionViolationError(Domain.AETERNITY, 'Invalid public key.')
  }

  return newPublicKey(publicKey, format)
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  switch (publicKey.format) {
    case 'encoded':
      return newPublicKey(convertEncodedBytesString(PK_PREFIX, publicKey.value, targetFormat), targetFormat)
    case 'hex':
      return newPublicKey(convertHexBytesString(PK_PREFIX, publicKey.value, targetFormat), targetFormat)
    default:
      assertNever(publicKey.format)
      throw new UnsupportedError(Domain.AETERNITY, 'Unsupported public key format.')
  }
}
