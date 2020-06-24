import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonBool extends MichelsonType {
  constructor(readonly value: boolean) {
    super()
  }

  public static from(value: unknown): MichelsonBool {
    return isMichelinePrimitiveApplication(value)
      ? this.fromMicheline(value)
      : this.fromRaw(value)
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>): MichelsonBool {
    if (micheline.prim !== 'True' && micheline.prim !== 'False') {
      throw invalidArgumentTypeError('MichelsonBool', 'prim: True | False', `prim: ${micheline.prim}`)
    }
    
    return new MichelsonBool(micheline.prim === 'True')
  }

  public static fromRaw(raw: unknown): MichelsonBool {
    if (typeof raw !== 'boolean') {
      throw invalidArgumentTypeError('MichelsonBool', 'boolean', typeof raw)
    }

    return new MichelsonBool(raw)
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.value ? 'True' : 'False',
    }
  }
}