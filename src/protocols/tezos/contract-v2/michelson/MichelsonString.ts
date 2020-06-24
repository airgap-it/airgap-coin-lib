import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../micheline/MichelineNode'
import { isMichelinePrimitive } from '../micheline/utils'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonString extends MichelsonTypeMapping {
  constructor(readonly value: string) {
    super()
  }

  public static from(value: unknown): MichelsonString {
    return isMichelinePrimitive('string', value)
      ? this.fromMicheline(value)
      : this.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'>): MichelsonString {
    return this.fromUnknown(micheline.string)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonString {
    if (typeof unknownValue !== 'string') {
      throw invalidArgumentTypeError('MichelsonString', 'string', typeof unknownValue)
    }

    return new MichelsonString(unknownValue)
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      string: this.value
    }
  }
}