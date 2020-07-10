import { isHex } from '../../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../../micheline/MichelineNode'
import { isMichelinePrimitive } from '../../utils'
import { MichelsonType } from '../MichelsonType'

import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonString } from './MichelsonString'

export class MichelsonAddress extends MichelsonType {
  constructor(public readonly address: MichelsonString | MichelsonBytes, name?: string) {
    super(name)
  }

  public static from(value: unknown): MichelsonAddress {
    return isMichelinePrimitive('string', value) || isMichelinePrimitive('bytes', value)
      ? MichelsonAddress.fromMicheline(value)
      : MichelsonAddress.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'> | MichelinePrimitive<'bytes'>): MichelsonAddress {
    const value: MichelsonString | MichelsonBytes = isMichelinePrimitive('string', micheline)
      ? MichelsonString.fromMicheline(micheline) 
      : MichelsonBytes.fromMicheline(micheline)

    return new MichelsonAddress(value)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonAddress {
    if (unknownValue instanceof MichelsonAddress) {
      return unknownValue
    }

    let value: MichelsonString | MichelsonBytes
    if (typeof unknownValue === 'string' && (unknownValue.toLowerCase().startsWith('tz') || unknownValue.toLowerCase().startsWith('kt'))) {
      value = MichelsonString.from(unknownValue)
    } else if ((typeof unknownValue === 'string' && isHex(unknownValue)) || Buffer.isBuffer(unknownValue)) {
      value = MichelsonBytes.from(unknownValue)
    } else {
      throw new Error('MichelsonAddress: invalid value.')
    }

    return new MichelsonAddress(value)
  }

  public asRawValue(): Record<string, string>  | string {
    const value: string = Buffer.isBuffer(this.address.value) ? this.address.value.toString('hex') : this.address.value

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.address.toMichelineJSON()
  }

}