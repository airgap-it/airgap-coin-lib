import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { BytesStringFormat } from '@airgap/module-kit'

import { BASE58_PREFIX, decodeBase58, encodeBase58 } from './encoding'

export function convertEncodedBytesString(type: keyof typeof BASE58_PREFIX, encoded: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'encoded':
      return encoded
    case 'hex':
      const bytes: Buffer = decodeBase58(encoded, type)

      return Buffer.from(bytes).toString('hex')
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported bytes string format.')
  }
}

export function convertHexBytesString(type: keyof typeof BASE58_PREFIX, hex: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'hex':
      return hex
    case 'encoded':
      const encoded: string = encodeBase58(hex, type)

      return encoded
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.TEZOS, 'Unsupported bytes string format.')
  }
}
