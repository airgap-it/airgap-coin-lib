import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { BytesStringFormat } from '@airgap/module-kit'
import { StrKey } from '@stellar/stellar-sdk'

export function convertEncodedBytesString(encoded: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'encoded':
      return encoded
    case 'hex':
      const rawBytes = StrKey.decodeEd25519PublicKey(encoded)
      return Buffer.from(rawBytes).toString('hex')
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.STELLAR, 'Unsupported bytes string format.')
  }
}

export function convertHexBytesString(hex: string, targetFormat: BytesStringFormat): string {
  switch (targetFormat) {
    case 'hex':
      return hex
    case 'encoded':
      return StrKey.encodeEd25519PublicKey(Buffer.from(hex, 'hex'))
    default:
      assertNever(targetFormat)
      throw new UnsupportedError(Domain.STELLAR, 'Unsupported bytes string format.')
  }
}
