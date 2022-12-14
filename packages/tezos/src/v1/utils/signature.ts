import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newSignature, Signature } from '@airgap/module-kit'

import { convertEncodedBytesString, convertHexBytesString } from './convert'

export function convertSignature(signature: Signature, targetFormat: Signature['format']): Signature {
  if (signature.format === targetFormat) {
    return signature
  }

  switch (signature.format) {
    case 'encoded':
      return newSignature(convertEncodedBytesString('ed25519Signature', signature.value, targetFormat), targetFormat)
    case 'hex':
      return newSignature(convertHexBytesString('ed25519Signature', signature.value, targetFormat), targetFormat)
    default:
      assertNever(signature.format)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported signature format.')
  }
}
