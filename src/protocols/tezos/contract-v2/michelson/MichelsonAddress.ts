import { isHex } from '../../../../utils/hex'
import { MichelineDataNode, MichelinePrimitive } from '../micheline/MichelineNode'
import { isMichelinePrimitive } from '../micheline/utils'

import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonString } from './MichelsonString'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonAddress extends MichelsonTypeMapping {
  constructor(readonly address: MichelsonString | MichelsonBytes) {
    super()
  }

  public static from(value: unknown): MichelsonAddress {
    return isMichelinePrimitive('string', value) || isMichelinePrimitive('bytes', value)
      ? this.fromMicheline(value)
      : this.fromUnknown(value)
  }

  public static fromMicheline(micheline: MichelinePrimitive<'string'> | MichelinePrimitive<'bytes'>): MichelsonAddress {
    const value: MichelsonString | MichelsonBytes = isMichelinePrimitive('string', micheline)
      ? MichelsonString.fromMicheline(micheline) 
      : MichelsonBytes.fromMicheline(micheline)

    return new MichelsonAddress(value)
  }

  public static fromUnknown(unknownValue: unknown): MichelsonAddress {
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

  public toMichelineJSON(): MichelineDataNode {
    return this.address.toMichelineJSON()
  }

}