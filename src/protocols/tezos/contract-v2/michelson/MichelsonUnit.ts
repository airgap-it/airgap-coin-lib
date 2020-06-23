import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonUnit extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonUnit {
    return isMichelinePrimitiveApplication(args[0])
      ? this.fromMicheline(args[0])
      : new MichelsonUnit()
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonData>): MichelsonUnit {
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