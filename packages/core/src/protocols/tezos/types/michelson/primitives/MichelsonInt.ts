import * as bigInt from '../../../../../dependencies/src/big-integer-1.6.45/BigInteger'
import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'
import { MichelsonTypeUtils } from '../MichelsonTypeUtils'

export class MichelsonInt extends MichelsonType {
  public readonly value: BigNumber

  constructor(value: number | string | BigNumber, name?: string) {
    super(name)
    this.value = BigNumber.isBigNumber(value) ? value : new BigNumber(value)
  }

  public static from(value: unknown, name?: string): MichelsonInt {
    return isMichelinePrimitive('int', value) ? MichelsonInt.fromMicheline(value, name) : MichelsonInt.fromUnknown(value, name)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'int'>, name?: string): MichelsonInt {
    return MichelsonInt.fromUnknown(parseInt(micheline.int, 10), name)
  }

  public static fromUnknown(unknownValue: unknown, name?: string): MichelsonInt {
    if (unknownValue instanceof MichelsonInt) {
      return unknownValue
    }

    if (typeof unknownValue !== 'number' && typeof unknownValue !== 'string' && !BigNumber.isBigNumber(unknownValue)) {
      throw invalidArgumentTypeError('MichelsonInt', 'number or string or BigNumber', typeof unknownValue)
    }

    return new MichelsonInt(BigNumber.isBigNumber(unknownValue) ? unknownValue : new BigNumber(unknownValue), name)
  }

  public encode(): string {
    let absValue = bigInt(this.value.integerValue().abs().toString())
    const u8Numbers: bigInt.BigInteger[] = []

    u8Numbers.push(absValue.and(0b00111111).or(this.value.lt(0) ? 0b11000000 : 0b10000000))
    absValue = absValue.shiftRight(6)

    while (absValue.gt(0)) {
      u8Numbers.push(absValue.and(0b01111111).or(0b10000000))
      absValue = absValue.shiftRight(7)
    }

    u8Numbers[u8Numbers.length - 1] = u8Numbers[u8Numbers.length - 1].and(0b01111111)

    return u8Numbers
      .reduce(
        (bytes, next) => Buffer.concat([bytes, Buffer.from(new Uint8Array([next.toJSNumber()]))]),
        MichelsonTypeUtils.literalPrefixes.int
      )
      .toString('hex')
  }

  public asRawValue(): Record<string, BigNumber> | BigNumber {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      int: this.value.toString()
    }
  }
}
