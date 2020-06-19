import { MichelsonTypeMapping } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'
import { assertTypes } from '../../../../utils/assert'

export class MichelsonBool extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonBool {
    assertTypes('MichelsonBool', 'boolean', args)

    return new MichelsonBool(args[0])
  }

  constructor(readonly value: boolean) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      prim: 'bool',
      args: [
        {
          string: this.value ? 'True' : 'False'
        }
      ]
    }
  }
}