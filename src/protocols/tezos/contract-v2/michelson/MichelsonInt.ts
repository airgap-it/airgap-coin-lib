import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export class MichelsonInt extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonInt {
    if (typeof args[0] !== 'number') {
      throw invalidArgumentTypeError('MichelsonInt', 'number', typeof args[0])
    }

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