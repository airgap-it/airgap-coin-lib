import { MichelsonTypeMapping } from './MichelsonTypeMapping'

import { MichelsonBool } from './MichelsonBool'
import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonInt } from './MichelsonInt'
import { MichelsonList } from './MichelsonList'
import { MichelsonPair } from './MichelsonPair'
import { MichelsonString } from './MichelsonString'
import { MichelsonUnit } from './MichelsonUnit'

export const michelsonTypeFactories = {
  nat: (...args: unknown[]) => MichelsonInt.from(...args),
  int: (...args: unknown[]) => MichelsonInt.from(...args),
  string: (...args: unknown[]) => MichelsonString.from(...args),
  bytes: (...args: unknown[]) => MichelsonBytes.from(...args),
  mutez: () => notSupported('mutez'),
  bool: (...args: unknown[]) => MichelsonBool.from(...args),
  key_hash: () => notSupported('key_hash'),
  timestamp: () => notSupported('timestamp'),
  address: (...args: unknown[]) => MichelsonString.from(...args),
  key: () => notSupported('key'),
  unit: () => MichelsonUnit.from(),
  signature: () => notSupported('signature'),
  option: () => notSupported('option'),
  list: (...args: unknown[]) => MichelsonList.from(...args),
  set: () => notSupported('set'),
  operation: () => notSupported('operation'),
  contract: () => notSupported('contract'),
  pair: (...args: unknown[]) => MichelsonPair.from(...args),
  or: () => notSupported('or'),
  lambda: () => notSupported('lambda'),
  map: () => notSupported('map'),
  big_map: () => notSupported('big_map'),
  chain_id: () => notSupported('chain_id'),
}

export type MichelsonType = keyof typeof michelsonTypeFactories

function notSupported(type: MichelsonType): MichelsonTypeMapping {
  throw new Error(`Michelson type ${type} is not supported.`)
}