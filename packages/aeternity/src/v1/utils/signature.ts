import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newSignature, Signature } from '@airgap/module-kit'

import { convertEncodedBytesString, convertHexBytesString } from './convert'

const SIG_PREFIX: string = 'sg_'

export function convertSignature(signature: Signature, targetFormat: Signature['format']): Signature {
  if (signature.format === targetFormat) {
    return signature
  }

  switch (signature.format) {
    case 'encoded':
      return newSignature(convertEncodedBytesString(SIG_PREFIX, signature.value, targetFormat), targetFormat)
    case 'hex':
      return newSignature(convertHexBytesString(SIG_PREFIX, signature.value, targetFormat), targetFormat)
    default:
      assertNever(signature.format)
      throw new UnsupportedError(Domain.AETERNITY, 'Unsupported signature format.')
  }
}
