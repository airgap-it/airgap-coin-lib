import { assertNever, Domain } from '@airgap/coinlib-core'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { newPublicKey, PublicKey } from '@airgap/module-kit'
import { StrKey } from '@stellar/stellar-sdk'

import { convertEncodedBytesString, convertHexBytesString } from './convert'

export function stellarPublicKey(publicKey: string): PublicKey {
  const format: PublicKey['format'] | undefined = isHex(publicKey)
    ? 'hex'
    : StrKey.isValidEd25519PublicKey(publicKey)
      ? 'encoded'
      : undefined

  if (format === undefined) {
    throw new ConditionViolationError(Domain.STELLAR, 'Invalid Stellar public key.')
  }

  return newPublicKey(publicKey, format)
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  switch (publicKey.format) {
    case 'encoded':
      return newPublicKey(convertEncodedBytesString(publicKey.value, targetFormat), targetFormat)
    case 'hex':
      return newPublicKey(convertHexBytesString(publicKey.value, targetFormat), targetFormat)
    default:
      assertNever(publicKey.format)
      throw new UnsupportedError(Domain.STELLAR, 'Unsupported public key format.')
  }
}
