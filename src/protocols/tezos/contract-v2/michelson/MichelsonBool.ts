import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineDataNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export class MichelsonBool extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonBool {
    if (typeof args[0] !== 'boolean') {
      throw invalidArgumentTypeError('MichelsonBool', 'boolean', typeof args[0])
    }

    return new MichelsonBool(args[0])
  }

  constructor(readonly value: boolean) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.value ? 'True' : 'False',
    }
  }
}