import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { invalidArgumentTypeError } from '@airgap/coinlib-core/utils/error'

import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'
import { MichelsonTypeUtils } from '../MichelsonTypeUtils'

export class MichelsonString extends MichelsonType {
  constructor(public readonly value: string, name?: string) {
    super(name)
  }

  public static from(value: unknown, name?: string): MichelsonString {
    return isMichelinePrimitive('string', value) ? MichelsonString.fromMicheline(value, name) : MichelsonString.fromUnknown(value, name)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'>, name?: string): MichelsonString {
    return MichelsonString.fromUnknown(micheline.string, name)
  }

  public static fromUnknown(unknownValue: unknown, name?: string): MichelsonString {
    if (unknownValue instanceof MichelsonString) {
      return unknownValue
    }

    if (typeof unknownValue !== 'string') {
      throw invalidArgumentTypeError('MichelsonString', 'string', typeof unknownValue)
    }

    return new MichelsonString(unknownValue, name)
  }

  public static decode(bytes: Buffer): MichelsonString {
    const prefix: Buffer = bytes.slice(0, MichelsonTypeUtils.literalPrefixes.string.length)
    if (!prefix.equals(MichelsonTypeUtils.literalPrefixes.string)) {
      throw new ConditionViolationError(Domain.TEZOS, 'Invalid encoded MichelsonString.')
    }

    const length: number = bytes.readInt32BE(prefix.length)
    const valueStart: number = prefix.length + 4
    const valueEnd: number = valueStart + length
    const value: string = bytes.slice(valueStart, valueEnd).toString()

    return new MichelsonString(value)
  }

  public encode(): Buffer {
    const bytes: Buffer = Buffer.from(this.value)
    const length: Buffer = Buffer.alloc(4)
    length.writeInt32BE(bytes.length)

    return Buffer.concat([MichelsonTypeUtils.literalPrefixes.string, length, bytes])
  }

  public asRawValue(): Record<string, string> | string {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      string: this.value
    }
  }
}
