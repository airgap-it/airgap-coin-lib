import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { hexToBytes } from '../../../../utils/hex'
import { MichelineDataNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export class MichelsonBytes extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonBytes {
    if (typeof args[0] !== 'string' && !Buffer.isBuffer(args[0])) {
      throw invalidArgumentTypeError('MichelsonBytes', 'string or Buffer', `${typeof args[0]}: ${args[0]}`)
    }

    return new MichelsonBytes(hexToBytes(args[0]))
  }

  constructor(readonly value: Buffer) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      bytes: this.value.toString('hex')
    }
  }

}