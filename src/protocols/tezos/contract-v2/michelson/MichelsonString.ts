import { MichelsonTypeMapping } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'
import { assertTypes } from '../../../../utils/assert'

export class MichelsonString extends MichelsonTypeMapping {
  public static from(...args: any[]): MichelsonString {
    assertTypes('MichelsonString', "string", args)

    return new MichelsonString(args[0])
  }

  constructor(readonly value: string) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      string: this.value
    }
  }
}