import { stripHexPrefix } from '../../../../../../utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALECompactInt } from './SCALECompactInt'
import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALEString extends SCALEType {
  public static from(value: string): SCALEString {
    return new SCALEString(value)
  }

  public static decode(hex: string): SCALEDecodeResult<SCALEString> {
    let _hex = stripHexPrefix(hex)

    const length = SCALECompactInt.decode(_hex)

    _hex = _hex.substr(length.bytesDecoded * 2, length.decoded.toNumber() * 2)

    const decoded = new TextDecoder().decode(Buffer.from(_hex, 'hex'))

    return {
      bytesDecoded: length.bytesDecoded + length.decoded.toNumber(), // utf-8 encoding
      decoded: SCALEString.from(decoded)
    }
  }

  private constructor(readonly value: string) {
    super()
  }

  public toCamelCase(options: { startUpper: boolean } = { startUpper: false }): string {
    return this.value
      .replace(/[-_]+/g, ' ')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => {
        return index === 0 && !options.startUpper ? match.toLowerCase() : match.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  public toString(): string {
    return this.value
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    const encoded = new TextEncoder().encode(this.value)

    return SCALECompactInt.from(this.value.length).encode() + Buffer.from(encoded).toString('hex')
  }
}
