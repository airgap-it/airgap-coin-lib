import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineDataNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export class MichelsonString extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonString {
    if (typeof args[0] !== 'string') {
      throw invalidArgumentTypeError('MichelsonString', 'string', typeof args[0])
    }

    return new MichelsonString(args[0])
  }

  constructor(readonly value: string) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      string: this.value
    }
  }
}