import { MichelsonTypeMapping } from './MichelsonTypeMapping'

import { MichelsonBool } from './MichelsonBool'
import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonInt } from './MichelsonInt'
import { MichelsonList } from './MichelsonList'
import { MichelsonOption } from './MichelsonOption'
import { MichelsonOr } from './MichelsonOr'
import { MichelsonPair } from './MichelsonPair'
import { MichelsonString } from './MichelsonString'
import { MichelsonUnit } from './MichelsonUnit'

import { isHex } from '../../../../utils/hex'

export const michelsonTypeFactories = {
  nat: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(...args),
  int: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(...args),
  string: (...args: unknown[]): MichelsonTypeMapping => MichelsonString.from(...args),
  bytes: (...args: unknown[]): MichelsonTypeMapping => MichelsonBytes.from(...args),
  mutez: (): MichelsonTypeMapping => notSupported('mutez'),
  bool: (...args: unknown[]): MichelsonTypeMapping => MichelsonBool.from(...args),
  key_hash: (): MichelsonTypeMapping => notSupported('key_hash'),
  timestamp: (): MichelsonTypeMapping => notSupported('timestamp'),
  address: (...args: unknown[]): MichelsonTypeMapping => {
    if (typeof args[0] === 'string' && args[0].toLowerCase().startsWith('kt')) {
      return MichelsonString.from(...args)
    } else if ((typeof args[0] === 'string' && isHex(args[0])) || Buffer.isBuffer(args[0])) {
      return MichelsonBytes.from(...args)
    } else {
      throw new Error('MichelsonAddress: invalid value.')
    }
  },
  key: (): MichelsonTypeMapping => notSupported('key'),
  unit: (): MichelsonTypeMapping => MichelsonUnit.from(),
  signature: (): MichelsonTypeMapping => notSupported('signature'),
  option: (...args: unknown[]): MichelsonTypeMapping => MichelsonOption.from(...args),
  list: (...args: unknown[]): MichelsonTypeMapping => MichelsonList.from(...args),
  set: (): MichelsonTypeMapping => notSupported('set'),
  operation: (): MichelsonTypeMapping => notSupported('operation'),
  contract: (): MichelsonTypeMapping => notSupported('contract'),
  pair: (...args: unknown[]): MichelsonTypeMapping => MichelsonPair.from(...args),
  or: (...args: unknown[]): MichelsonTypeMapping => MichelsonOr.from(...args),
  lambda: (): MichelsonTypeMapping => notSupported('lambda'),
  map: (): MichelsonTypeMapping => notSupported('map'),
  big_map: (): MichelsonTypeMapping => notSupported('big_map'),
  chain_id: (): MichelsonTypeMapping => notSupported('chain_id'),
}

export type MichelsonType = keyof typeof michelsonTypeFactories

function notSupported(type: MichelsonType): MichelsonTypeMapping {
  throw new Error(`Michelson type ${type} is not supported.`)
}