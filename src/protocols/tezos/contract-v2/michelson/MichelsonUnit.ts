import { MichelsonTypeMapping } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'
import { assertTypes } from '../../../../utils/assert'

export class MichelsonUnit extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonUnit {
    assertTypes('MichelsonUnit', [], args)

    return new MichelsonUnit()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      prim: 'unit'
    }
  }
}