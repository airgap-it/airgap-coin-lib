import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonUnit extends MichelsonType {
  public static from(value: unknown): MichelsonUnit {
    if (value instanceof MichelsonUnit) {
      return value
    } else if (isMichelinePrimitiveApplication(value)) {
      return MichelsonUnit.fromMicheline(value)
    } else {
      return new MichelsonUnit()
    }
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>): MichelsonUnit {
    if (micheline.prim !== 'Unit') {
      throw invalidArgumentTypeError('MichelsonUnit', 'prim: Unit', `prim: ${micheline.prim}`)
    }

    return new MichelsonUnit()
  }
  
  public asRawValue(): any {
    return undefined
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Unit'
    }
  }
}