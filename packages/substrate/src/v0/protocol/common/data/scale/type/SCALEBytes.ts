import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { isHex, stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALECompactInt } from './SCALECompactInt'
import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALEBytes extends SCALEType {
  public static from(bytes: string | Buffer | Uint8Array): SCALEBytes {
    let buffer: Buffer
    if (typeof bytes === 'string' && isHex(bytes)) {
      buffer = Buffer.from(stripHexPrefix(bytes), 'hex')
    } else if (!(typeof bytes === 'string')) {
      buffer = Buffer.from(bytes)
    } else {
      throw new InvalidValueError(Domain.SUBSTRATE, 'SCALEBytes#from: Unknown bytes type.')
    }

    return new SCALEBytes(buffer)
  }

  public static decode(hex: string): SCALEDecodeResult<SCALEBytes> {
    const _hex = stripHexPrefix(hex)

    const length = SCALECompactInt.decode(_hex)
    const bytes = _hex.substr(length.bytesDecoded * 2, length.decoded.toNumber() * 2)

    return {
      bytesDecoded: length.bytesDecoded + length.decoded.toNumber(),
      decoded: SCALEBytes.from(bytes)
    }
  }

  private constructor(readonly bytes: Buffer) {
    super()
  }

  public toString(encoding: BufferEncoding = 'hex'): string {
    return this.bytes.toString(encoding)
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return SCALECompactInt.from(this.bytes.length).encode(config) + this.bytes.toString('hex')
  }
}
