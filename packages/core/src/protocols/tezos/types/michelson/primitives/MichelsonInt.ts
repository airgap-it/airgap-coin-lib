import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonInt extends MichelsonType {
  constructor(public readonly value: BigNumber, name?: string) {
    super(name)
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

  public asRawValue(): Record<string, BigNumber> | BigNumber {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      int: this.value.toString()
    }
  }
}
