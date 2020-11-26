import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonString extends MichelsonType {
  constructor(public readonly value: string, name?: string) {
    super(name)
  }

  public static from(value: unknown, name?: string): MichelsonString {
    return isMichelinePrimitive('string', value)
      ? MichelsonString.fromMicheline(value, name)
      : MichelsonString.fromUnknown(value, name)
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

  public asRawValue(): Record<string, string> | string {
    return this.name ? { [this.name]: this.value } : this.value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      string: this.value
    }
  }
}