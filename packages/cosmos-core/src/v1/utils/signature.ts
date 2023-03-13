import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { Signature } from '@airgap/module-kit'

export function convertSignature(signature: Signature, targetFormat: Signature['format']): Signature {
  if (signature.format === targetFormat) {
    return signature
  }

  throw new UnsupportedError(Domain.COSMOS, 'Unsupported signature key conversion.')
}
