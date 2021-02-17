import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { changeEndianness, stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { padStart } from '../../../../../../utils/padStart'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEInt } from './SCALEInt'
import { SCALEEncodeConfig, SCALEType } from './SCALEType'

type Number = SCALECompactInt | SCALEInt | BigNumber | number

export class SCALECompactInt extends SCALEType {
  public static from(value: number | BigNumber | string): SCALECompactInt {
    return new SCALECompactInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value))
  }

  public static decode(hex: string): SCALEDecodeResult<SCALECompactInt> {
    const _hex = stripHexPrefix(hex)

    const firstByte = padStart(parseInt(_hex.substr(0, 2), 16).toString(2), 8, '0')
    const mode = parseInt(firstByte.slice(-2), 2)

    let bytes: number
    let metaBits: number
    if (mode === 3) {
      bytes = parseInt(firstByte.slice(0, -2), 2) + 5 // + 4 bytes of original length + 1 byte of meta
      metaBits = 8
    } else {
      bytes = 1 << mode
      metaBits = 2
    }

    const encodedHex = _hex.substr(0, bytes * 2)
    const encodedBin = padStart(new BigNumber(changeEndianness(encodedHex), 16).toString(2), metaBits + 1, '0')

    return {
      bytesDecoded: bytes,
      decoded: SCALECompactInt.from(new BigNumber(encodedBin.slice(0, -metaBits), 2))
    }
  }

  private constructor(readonly value: BigNumber) {
    super()
  }

  public toString(base: number = 10): string {
    return this.value.toString(base)
  }

  public toNumber(): number {
    return this.value.toNumber()
  }

  public plus(other: Number): SCALECompactInt {
    return this.applyOperation(other, BigNumber.prototype.plus)
  }

  public minus(other: Number): SCALECompactInt {
    return this.applyOperation(other, BigNumber.prototype.minus)
  }

  public multiply(other: Number): SCALECompactInt {
    return this.applyOperation(other, BigNumber.prototype.multipliedBy)
  }

  public divide(other: Number): SCALECompactInt {
    return this.applyOperation(other, BigNumber.prototype.dividedBy)
  }

  public lt(other: Number): boolean {
    return this.performOperation(other, BigNumber.prototype.lt)
  }

  public lte(other: Number): boolean {
    return this.performOperation(other, BigNumber.prototype.lte)
  }

  public gt(other: Number): boolean {
    return this.performOperation(other, BigNumber.prototype.gt)
  }

  public gte(other: Number): boolean {
    return this.performOperation(other, BigNumber.prototype.gte)
  }

  public eq(other: Number): boolean {
    return this.performOperation(other, BigNumber.prototype.eq)
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    const bits = this.value.toString(2).length
    let mode: number
    if (bits <= 6) {
      // 0b00: single-byte mode, upper six bits are the LE encoding of the value (valid only for values of 0-63)
      mode = 0
    } else if (bits <= 14) {
      // 0b01: two-byte mode: upper six bits and the following byte is the LE encoding of the value (valid only for values 64-(2**14-1))
      mode = 1
    } else if (bits <= 30) {
      // 0b10: four-byte mode: upper six bits and the following three bytes are the LE encoding of the value (valid only for values (2**14)-(2**30-1))
      mode = 2
    } else {
      // 0b11: Big-integer mode: The upper six bits are the number of bytes following, less four. The value is contained, LE encoded, in the bytes following. The final (most significant) byte must be non-zero. Valid only for values (2**30)-(2**536-1)
      mode = 3
    }

    const bytes: number = mode === 3
      ? Math.ceil(bits / 8)
      : Math.pow(2, mode)

    const value: BigNumber = mode === 3
      ? this.value.multipliedBy(64).plus(bytes - 4) // value << 6 + number of bytes less 4
      : this.value

    const encodedValue = value.multipliedBy(4).plus(mode) // value << 2 + mode

    return changeEndianness(toHexStringRaw(encodedValue, bytes * 8))
  }

  private applyOperation(other: Number, operation: (_: number | BigNumber) => BigNumber): SCALECompactInt {
    return new SCALECompactInt(this.performOperation(other, operation))
  }

  private performOperation<T>(other: Number, operation: (_: number | BigNumber) => T): T {
    if (typeof other === 'number' || BigNumber.isBigNumber(other)) {
      return operation.apply(this.value, [other])
    } else {
      return this.performOperation(other.value, operation)
    }
  }
}
