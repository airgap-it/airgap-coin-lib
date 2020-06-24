import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonInt extends MichelsonType {
  constructor(readonly value: BigNumber) {
    super()
  }

  public static from(value: unknown): MichelsonInt {
    return isMichelinePrimitive('int', value)
      ? this.fromMicheline(value)
      : this.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'int'>): MichelsonInt {
    return this.fromUnknown(parseInt(micheline.int, 10))
  }

  public static fromUnknown(unknownValue: unknown): MichelsonInt {
    if (typeof unknownValue !== 'number' && typeof unknownValue !== 'string' && !BigNumber.isBigNumber(unknownValue)) {
      throw invalidArgumentTypeError('MichelsonInt', 'number or string or BigNumber', typeof unknownValue)
    }

    return new MichelsonInt(BigNumber.isBigNumber(unknownValue) ? unknownValue : new BigNumber(unknownValue))
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      int: this.value.toString()
    }
  }
}