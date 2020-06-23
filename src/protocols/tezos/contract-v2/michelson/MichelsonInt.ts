import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../micheline/MichelineNode'
import { isMichelinePrimitive } from '../micheline/utils'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonInt extends MichelsonTypeMapping {
  constructor(readonly value: number) {
    super()
  }

  public static from(...args: unknown[]): MichelsonInt {
    return isMichelinePrimitive('int', args[0])
      ? this.fromMicheline(args[0])
      : this.fromUnknown(args[0])
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