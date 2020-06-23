import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineDataNode } from '../micheline/MichelineNode'
import { MichelsonString } from './MichelsonString'
import { MichelsonBytes } from './MichelsonBytes'
import { isHex } from '../../../../utils/hex'

export class MichelsonAddress extends MichelsonTypeMapping {
  public static from(...args: unknown[]): MichelsonAddress {
    let value: MichelsonString | MichelsonBytes
    if (typeof args[0] === 'string' && (args[0].toLowerCase().startsWith('tz') || args[0].toLowerCase().startsWith('kt'))) {
      value = MichelsonString.from(...args)
    } else if ((typeof args[0] === 'string' && isHex(args[0])) || Buffer.isBuffer(args[0])) {
      value = MichelsonBytes.from(...args)
    } else {
      throw new Error('MichelsonAddress: invalid value.')
    }

    return new MichelsonAddress(value)
  }

  constructor(readonly address: MichelsonString | MichelsonBytes) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.address.toMichelineJSON()
  }

}