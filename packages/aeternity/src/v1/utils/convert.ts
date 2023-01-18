import { assertNever, Domain } from '@airgap/coinlib-core'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { BytesStringFormat } from '@airgap/module-kit'

export function convertEncodedBytesString(prefix: string, encoded: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'encoded':
      return encoded
    case 'hex':
      const base58Encoded: string = encoded.replace(prefix, '')
      const bytes: Buffer = bs58check.decode(base58Encoded)

      return Buffer.from(bytes).toString('hex')
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.AETERNITY, 'Unsupported bytes string format.')
  }
}

export function convertHexBytesString(prefix: string, hex: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'hex':
      return hex
    case 'encoded':
      const base58Encoded: string = bs58check.encode(Buffer.from(hex, 'hex'))

      return `${prefix}${base58Encoded}`
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.AETERNITY, 'Unsupported bytes string format.')
  }
}
