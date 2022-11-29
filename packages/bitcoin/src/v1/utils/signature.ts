import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { newSignature, Signature } from '@airgap/module-kit'

export function convertSignature(signature: Signature, targetFormat: Signature['format']): Signature {
  if (signature.format === targetFormat) {
    return signature
  }

  switch (signature.format) {
    case 'encoded':
      return newSignature(convertEncodedSignature(signature.value, targetFormat))
    case 'hex':
      return newSignature(convertHexSignature(signature.value, targetFormat))
    default:
      assertNever(signature.format)
      throw new UnsupportedError(Domain.BITCOIN, 'Unuspported signature format.')
  }
}

function convertEncodedSignature(signature: string, targetFormat: Signature['format']): string {
  if (targetFormat === 'encoded') {
    return signature
  }

  return Buffer.from(signature, 'base64').toString('hex')
}

function convertHexSignature(signature: string, targetFormat: Signature['format']): string {
  if (targetFormat === 'hex') {
    return signature
  }

  return Buffer.from(signature, 'hex').toString('base64')
}
