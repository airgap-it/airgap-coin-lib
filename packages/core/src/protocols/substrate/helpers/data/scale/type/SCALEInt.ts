import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { changeEndianness, stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALECompactInt } from './SCALECompactInt'
import { SCALEType } from './SCALEType'

type Number = SCALECompactInt | SCALEInt | BigNumber | number

export class SCALEInt extends SCALEType {
  public static from(value: number | BigNumber | string, bitLength?: number): SCALEInt {
    return new SCALEInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value), bitLength)
  }

  public static decode(hex: string, bitLength?: number): SCALEDecodeResult<SCALEInt> {
    let _hex = stripHexPrefix(hex)

    const nibbles = bitLength !== undefined ? Math.ceil(bitLength / 4) : _hex.length
    _hex = changeEndianness(stripHexPrefix(hex).substr(0, nibbles))

    const decoded = new BigNumber(_hex, 16)

    return {
      bytesDecoded: Math.ceil(nibbles / 2),
      decoded: SCALEInt.from(decoded, bitLength)
    }
  }

  private constructor(readonly value: BigNumber, readonly bitLength?: number) {
    super()
  }

  public toString(base: number = 10): string {
    return this.value.toString(base)
  }

  public toNumber(): number {
    return this.value.toNumber()
  }

  public plus(other: Number): SCALEInt {
    return this.applyOperation(other, BigNumber.prototype.plus)
  }

  public minus(other: Number): SCALEInt {
    return this.applyOperation(other, BigNumber.prototype.minus)
  }

  public multiply(other: Number): SCALEInt {
    return this.applyOperation(other, BigNumber.prototype.multipliedBy)
  }

  public divide(other: Number): SCALEInt {
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

  protected _encode(): string {
    const hex = toHexStringRaw(this.value, this.bitLength)

    return changeEndianness(hex)
  }

  private applyOperation(other: Number, operation: (_: number | BigNumber) => BigNumber): SCALEInt {
    return new SCALEInt(this.performOperation(other, operation))
  }

  private performOperation<T>(other: Number, operation: (_: number | BigNumber) => T): T {
    if (typeof other === 'number' || BigNumber.isBigNumber(other)) {
      return operation.apply(this.value, [other])
    } else {
      return this.performOperation(other.value, operation)
    }
  }
}
