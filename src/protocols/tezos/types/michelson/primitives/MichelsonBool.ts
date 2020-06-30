import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonBool extends MichelsonType {
  constructor(public readonly value: boolean, name?: string) {
    super(name)
  }

  public static from(value: unknown): MichelsonBool {
    return isMichelinePrimitiveApplication(value)
      ? MichelsonBool.fromMicheline(value)
      : MichelsonBool.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>): MichelsonBool {
    if (micheline.prim !== 'True' && micheline.prim !== 'False') {
      throw invalidArgumentTypeError('MichelsonBool', 'prim: True | False', `prim: ${micheline.prim}`)
    }
    
    return new MichelsonBool(micheline.prim === 'True')
  }

  public static fromUnknown(unknownValue: unknown): MichelsonBool {
    if (unknownValue instanceof MichelsonBool) {
      return unknownValue
    }

    if (typeof unknownValue !== 'boolean') {
      throw invalidArgumentTypeError('MichelsonBool', 'boolean', typeof unknownValue)
    }

    return new MichelsonBool(unknownValue)
  }

  public asRawValue(): Record<string, boolean> | boolean {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.value ? 'True' : 'False',
    }
  }
}