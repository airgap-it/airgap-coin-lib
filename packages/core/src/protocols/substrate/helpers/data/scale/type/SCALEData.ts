import { hexToBytes, isHex, stripHexPrefix } from '../../../../../../utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEBytes } from './SCALEBytes'
import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export enum SCALEDataType {
  None = 0,
  Raw,
  BlakeTwo256,
  Sha256,
  Keccak256,
  ShaThree256
}

export class SCALEData extends SCALEType {
  public static from(type: SCALEDataType, bytes?: string | Uint8Array | Buffer): SCALEData {
    let dataType: SCALEDataType = type
    let buffer: Buffer | null
    if (typeof bytes === 'string' && isHex(bytes)) {
      buffer = Buffer.from(stripHexPrefix(bytes), 'hex')
    } else if (bytes && !(typeof bytes === 'string')) {
      buffer = Buffer.from(bytes)
    } else {
      dataType = SCALEDataType.None
      buffer = null
    }

    return new SCALEData(dataType, buffer)
  }

  public static decode(hex: string): SCALEDecodeResult<SCALEData> {
    const encoded = hexToBytes(hex)
    const indicator = encoded[0]

    let bytesDecoded: number
    let type: SCALEDataType
    if (indicator === 0) {
      bytesDecoded = 1
      type = SCALEDataType.None
    } else if (indicator >= 1 && indicator <= 33) {
      bytesDecoded = indicator
      type = SCALEDataType.Raw
    } else if (indicator >= 34 && indicator <= 37){
      bytesDecoded = 32 + 1
      type = SCALEDataType[SCALEDataType[indicator - 32]]
    } else {
      throw new Error('SCALEData#decode: Unknown data type')
    }

    const buffer = type !== SCALEDataType.None 
      ? SCALEBytes.from(encoded.subarray(1, bytesDecoded)).bytes 
      : null

    return {
      bytesDecoded,
      decoded: new SCALEData(type, buffer)
    }
  }

  constructor(readonly type: SCALEDataType, readonly bytes: Buffer | null) {
    super()
  }

  public toString(): string {
    if (this.type !== SCALEDataType.None && this.bytes === null) {
      throw new Error(`SCALEData#toString: type is ${SCALEDataType[this.type]} but data is null.`)
    }

    switch (this.type) {
      case SCALEDataType.None:
        return 'null'
      case SCALEDataType.Raw:
        const textDecoder = new TextDecoder()

        return textDecoder.decode(this.bytes!)
      default:
        return '' // TODO: add support for other types
    }
  }
  protected _encode(config?: SCALEEncodeConfig): string {
    if (this.type !== SCALEDataType.None && this.bytes === null) {
      throw new Error(`SCALEData#encode: type is ${SCALEDataType[this.type]} but data is null.`)
    }
    
    switch (this.type) {
      case SCALEDataType.None:
        return '0'
      case SCALEDataType.Raw:
        return SCALEBytes.from(this.bytes!).encode(config)
      default:
        throw new Error(`SCALEData#encode: type ${SCALEDataType[this.type]} is not supported.`)
    }
  }

}