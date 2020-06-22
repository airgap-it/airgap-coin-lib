import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineDataNode } from '../micheline/MichelineNode'

export class MichelsonUnit extends MichelsonTypeMapping {
  public static from(): MichelsonUnit {
    return new MichelsonUnit()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Unit'
    }
  }
}