import { invalidArgumentTypeError } from '@airgap/coinlib-core/utils/error'

import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isAnyMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonUnit extends MichelsonType {
  public static from(value: unknown, name?: string): MichelsonUnit {
    if (value instanceof MichelsonUnit) {
      return value
    } else if (isAnyMichelinePrimitiveApplication(value)) {
      return MichelsonUnit.fromMicheline(value, name)
    } else {
      return new MichelsonUnit()
    }
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonGrammarData>, name?: string): MichelsonUnit {
    if (micheline.prim !== 'Unit') {
      throw invalidArgumentTypeError('MichelsonUnit', 'prim: Unit', `prim: ${micheline.prim}`)
    }

    return new MichelsonUnit(name)
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
