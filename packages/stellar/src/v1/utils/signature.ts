import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newSignature, Signature } from '@airgap/module-kit'

export function convertSignature(signature: Signature, targetFormat: Signature['format']): Signature {
  if (signature.format === targetFormat) {
    return signature
  }

  switch (signature.format) {
    case 'encoded': // assume base64
      return newSignature(Buffer.from(signature.value, 'base64').toString('hex'), 'hex')
    case 'hex':
      return newSignature(Buffer.from(signature.value, 'hex').toString('base64'), 'encoded')
    default:
      assertNever(signature.format)
      throw new UnsupportedError(Domain.STELLAR, 'Unsupported signature format.')
  }
}
