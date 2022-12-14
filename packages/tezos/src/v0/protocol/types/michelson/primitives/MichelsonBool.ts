import { invalidArgumentTypeError } from '@airgap/coinlib-core/utils/error'

import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isAnyMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonBool extends MichelsonType {
  constructor(public readonly value: boolean, name?: string) {
    super(name)
  }

  public static from(value: unknown, name?: string): MichelsonBool {
    return isAnyMichelinePrimitiveApplication(value) ? MichelsonBool.fromMicheline(value, name) : MichelsonBool.fromUnknown(value, name)
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>, name?: string): MichelsonBool {
    if (micheline.prim !== 'True' && micheline.prim !== 'False') {
      throw invalidArgumentTypeError('MichelsonBool', 'prim: True | False', `prim: ${micheline.prim}`)
    }

    return new MichelsonBool(micheline.prim === 'True', name)
  }

  public static fromUnknown(unknownValue: unknown, name?: string): MichelsonBool {
    if (unknownValue instanceof MichelsonBool) {
      return unknownValue
    }

    if (typeof unknownValue !== 'boolean') {
      throw invalidArgumentTypeError('MichelsonBool', 'boolean', typeof unknownValue)
    }

    return new MichelsonBool(unknownValue, name)
  }

  public asRawValue(): Record<string, boolean> | boolean {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.value ? 'True' : 'False'
    }
  }
}
