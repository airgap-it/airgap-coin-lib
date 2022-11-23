import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { publicKey, PublicKey } from '@airgap/module-kit'
import { convertEncodedBytesString, convertHexBytesString } from './convert'

const PK_PREFIX = 'ak_'

export function aePublicKey(pk: string): PublicKey {
  const format: PublicKey['format'] | undefined = isHex(pk) ? 'hex' : pk.startsWith(PK_PREFIX) ? 'encoded' : undefined

  if (format === undefined) {
    throw new ConditionViolationError(Domain.AETERNITY, 'Invalid public key.')
  }

  return publicKey(pk, format)
}

export function convertPublicKey(pk: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (pk.format === targetFormat) {
    return pk
  }

  switch (pk.format) {
    case 'encoded':
      return publicKey(convertEncodedBytesString(PK_PREFIX, pk.value, targetFormat), targetFormat)
    case 'hex':
      return publicKey(convertHexBytesString(PK_PREFIX, pk.value, targetFormat), targetFormat)
  }
}
