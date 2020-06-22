import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineNode } from '../micheline/MichelineNode'

export class MichelsonUnit extends MichelsonTypeMapping {
  public static from(): MichelsonUnit {
    return new MichelsonUnit()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      prim: 'unit'
    }
  }
}