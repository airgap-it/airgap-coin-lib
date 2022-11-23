import { signature, Signature } from '@airgap/module-kit'
import { convertEncodedBytesString, convertHexBytesString } from './convert'

const SIG_PREFIX = 'sg_'

export function convertSignature(sig: Signature, targetFormat: Signature['format']): Signature {
  if (sig.format === targetFormat) {
    return sig
  }

  switch (sig.format) {
    case 'encoded':
      return signature(convertEncodedBytesString(SIG_PREFIX, sig.value, targetFormat), targetFormat)
    case 'hex':
      return signature(convertHexBytesString(SIG_PREFIX, sig.value, targetFormat), targetFormat)
  }
}
