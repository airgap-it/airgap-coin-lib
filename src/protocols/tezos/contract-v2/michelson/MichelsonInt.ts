import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../micheline/MichelineNode'
import { isMichelinePrimitive } from '../micheline/utils'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonInt extends MichelsonTypeMapping {
  constructor(readonly value: number) {
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
    if (typeof unknownValue !== 'number') {
      throw invalidArgumentTypeError('MichelsonInt', 'number', typeof unknownValue)
    }

    return new MichelsonInt(unknownValue)
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      int: this.value.toString()
    }
  }
}