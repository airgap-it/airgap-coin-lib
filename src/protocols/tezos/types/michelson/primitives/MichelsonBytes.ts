import { invalidArgumentTypeError } from '../../../../../utils/error'
import { hexToBytes } from '../../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonBytes extends MichelsonType {
  constructor(readonly value: Buffer) {
    super()
  }

  public static from(value: unknown): MichelsonBytes {
    return isMichelinePrimitive('bytes', value)
      ? this.fromMicheline(value)
      : this.fromUnknown(value)
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