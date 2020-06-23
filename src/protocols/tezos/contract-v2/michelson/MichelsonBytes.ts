import { invalidArgumentTypeError } from '../../../../utils/error'
import { hexToBytes } from '../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../micheline/MichelineNode'
import { isMichelinePrimitive } from '../micheline/utils'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonBytes extends MichelsonTypeMapping {
  constructor(readonly value: Buffer) {
    super()
  }

  public static from(...args: unknown[]): MichelsonBytes {
    return isMichelinePrimitive('bytes', args[0])
      ? this.fromMicheline(args[0])
      : this.fromUnknown(args[0])
  }

  public static fromMicheline(micheline: MichelinePrimitive<'bytes'>): MichelsonBytes {
    return this.fromUnknown(micheline.bytes)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonBytes {
    if (typeof unknownValue !== 'string' && !Buffer.isBuffer(unknownValue)) {
      throw invalidArgumentTypeError('MichelsonBytes', 'string or Buffer', `${typeof unknownValue}: ${unknownValue}`)
    }

    return new MichelsonBytes(hexToBytes(unknownValue))
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      bytes: this.value.toString('hex')
    }
  }

}