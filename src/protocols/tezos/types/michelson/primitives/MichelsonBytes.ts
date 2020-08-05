import { invalidArgumentTypeError } from '../../../../../utils/error'
import { hexToBytes } from '../../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonBytes extends MichelsonType {
  constructor(public readonly value: Buffer, name?: string) {
    super(name)
  }

  public static from(value: unknown): MichelsonBytes {
    return isMichelinePrimitive('bytes', value)
      ? MichelsonBytes.fromMicheline(value)
      : MichelsonBytes.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'bytes'>): MichelsonBytes {
    return MichelsonBytes.fromUnknown(micheline.bytes)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonBytes {
    if (unknownValue instanceof MichelsonBytes) {
      return unknownValue
    }

    if (typeof unknownValue !== 'string' && !Buffer.isBuffer(unknownValue)) {
      throw invalidArgumentTypeError('MichelsonBytes', 'string or Buffer', `${typeof unknownValue}: ${unknownValue}`)
    }

    return new MichelsonBytes(hexToBytes(unknownValue))
  }

  public asRawValue(): Record<string, string> | string {
    return this.name ? { [this.name]: this.value.toString('hex') } : this.value.toString('hex')
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      bytes: this.value.toString('hex')
    }
  }

}