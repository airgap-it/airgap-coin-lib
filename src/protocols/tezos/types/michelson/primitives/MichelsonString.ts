import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

export class MichelsonString extends MichelsonType {
  constructor(readonly value: string, name?: string) {
    super(name)
  }

  public static from(value: unknown): MichelsonString {
    return isMichelinePrimitive('string', value)
      ? this.fromMicheline(value)
      : this.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'>): MichelsonString {
    return this.fromUnknown(micheline.string)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonString {
    if (typeof unknownValue !== 'string') {
      throw invalidArgumentTypeError('MichelsonString', 'string', typeof unknownValue)
    }

    return new MichelsonString(unknownValue)
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