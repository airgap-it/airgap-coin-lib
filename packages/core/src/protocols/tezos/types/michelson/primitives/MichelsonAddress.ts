import { InvalidValueError } from '../../../../../errors'
import { Domain } from '../../../../../errors/coinlib-error'
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

  public static from(value: unknown, name?: string): MichelsonAddress {
    return isMichelinePrimitive('string', value) || isMichelinePrimitive('bytes', value)
      ? MichelsonAddress.fromMicheline(value, name)
      : MichelsonAddress.fromUnknown(value, name)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'> | MichelinePrimitive<'bytes'>, name?: string): MichelsonAddress {
    const value: MichelsonString | MichelsonBytes = isMichelinePrimitive('string', micheline)
      ? MichelsonString.fromMicheline(micheline)
      : MichelsonBytes.fromMicheline(micheline)

    return new MichelsonAddress(value, name)
  }

  public static fromUnknown(unknownValue: unknown, name?: string): MichelsonAddress {
    if (unknownValue instanceof MichelsonAddress) {
      return unknownValue
    }

    let value: MichelsonString | MichelsonBytes
    if (typeof unknownValue === 'string' && (unknownValue.toLowerCase().startsWith('tz') || unknownValue.toLowerCase().startsWith('kt'))) {
      value = MichelsonString.from(unknownValue)
    } else if ((typeof unknownValue === 'string' && isHex(unknownValue)) || Buffer.isBuffer(unknownValue)) {
      value = MichelsonBytes.from(unknownValue)
    } else {
      throw new InvalidValueError(Domain.TEZOS, 'MichelsonAddress: invalid value.')
    }

    return new MichelsonAddress(value, name)
  }

  public encode(): string {
    return this.address.encode()
  }

  public asRawValue(): Record<string, string> | string {
    const value: string = Buffer.isBuffer(this.address.value) ? this.address.value.toString('hex') : this.address.value

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.address.toMichelineJSON()
  }
}
