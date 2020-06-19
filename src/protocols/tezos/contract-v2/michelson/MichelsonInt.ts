import { MichelsonTypeMapping } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'
import { assertTypes } from '../../../../utils/assert'

export class MichelsonInt extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonInt {
    assertTypes('MichelsonInt', "number", args)

    return new MichelsonInt(args[0])
  }

  constructor(readonly value: number) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      int: this.value.toString()
    }
  }
}