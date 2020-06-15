import { isNumber } from 'util'

import { stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEType } from './SCALEType'

export class SCALEEnum<T> extends SCALEType {
  public static from<T>(value: T): SCALEEnum<T> {
    if (!isNumber(value)) {
      throw new Error('Invalid enum value')
    }

    return new SCALEEnum(value)
  }

  public static decode<T>(hex: string, getEnumValue: (value: number) => T | null): SCALEDecodeResult<SCALEEnum<T>> {
    const _hex = stripHexPrefix(hex)

    const value = parseInt(_hex.substr(0, 2), 16)
    const enumValue = getEnumValue(value)

    if (enumValue === null) {
      throw new Error('Unknown enum value')
    }

    return {
      bytesDecoded: 1,
      decoded: SCALEEnum.from(enumValue)
    }
  }

  private constructor(readonly value: T) {
    super()
  }

  public toString(): string {
    return ((this.value as any) as number).toString()
  }

  protected _encode(): string {
    return toHexStringRaw((this.value as any) as number)
  }
}
