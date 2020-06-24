import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonUnit extends MichelsonType {
  public static from(value: unknown): MichelsonUnit {
    return isMichelinePrimitiveApplication(value)
      ? this.fromMicheline(value)
      : new MichelsonUnit()
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>): MichelsonUnit {
    if (micheline.prim !== 'Unit') {
      throw invalidArgumentTypeError('MichelsonUnit', 'prim: Unit', `prim: ${micheline.prim}`)
    }

    return new MichelsonUnit()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Unit'
    }
  }
}