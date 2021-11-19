import { invalidArgumentTypeError } from '../../../../../utils/error'
import { bytesToHex, hexToBytes } from '../../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'
import { MichelsonTypeUtils } from '../MichelsonTypeUtils'

export class MichelsonBytes extends MichelsonType {
  public readonly value: Buffer

  constructor(value: Buffer | string, name?: string) {
    super(name)
    this.value = hexToBytes(value)
  }

  public static from(value: unknown, name?: string): MichelsonBytes {
    return isMichelinePrimitive('bytes', value) ? MichelsonBytes.fromMicheline(value, name) : MichelsonBytes.fromUnknown(value, name)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'bytes'>, name?: string): MichelsonBytes {
    return MichelsonBytes.fromUnknown(micheline.bytes, name)
  }

  public static fromUnknown(unknownValue: unknown, name?: string): MichelsonBytes {
    if (unknownValue instanceof MichelsonBytes) {
      return unknownValue
    }

    if (typeof unknownValue !== 'string' && !Buffer.isBuffer(unknownValue)) {
      throw invalidArgumentTypeError('MichelsonBytes', 'string or Buffer', `${typeof unknownValue}: ${unknownValue}`)
    }

    return new MichelsonBytes(unknownValue, name)
  }

  public encode(): string {
    const length = Buffer.alloc(4)
    length.writeInt32BE(this.value.length)

    return Buffer.concat([MichelsonTypeUtils.literalPrefixes.bytes, length, this.value]).toString('hex')
  }

  public asRawValue(): Record<string, string> | string {
    const value: string = bytesToHex(this.value)

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      bytes: bytesToHex(this.value)
    }
  }
}
