import { MichelsonAddress } from './MichelsonAddress'
import { MichelsonBool } from './MichelsonBool'
import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonInt } from './MichelsonInt'
import { MichelsonList } from './MichelsonList'
import { MichelsonOption } from './MichelsonOption'
import { MichelsonOr } from './MichelsonOr'
import { MichelsonPair } from './MichelsonPair'
import { MichelsonString } from './MichelsonString'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelsonUnit } from './MichelsonUnit'

export const michelsonTypeFactories = {
  nat: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(...args),
  int: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(...args),
  string: (...args: unknown[]): MichelsonTypeMapping => MichelsonString.from(...args),
  bytes: (...args: unknown[]): MichelsonTypeMapping => MichelsonBytes.from(...args),
  mutez: (): MichelsonTypeMapping => notSupported('mutez'),
  bool: (...args: unknown[]): MichelsonTypeMapping => MichelsonBool.from(...args),
  key_hash: (): MichelsonTypeMapping => notSupported('key_hash'),
  timestamp: (): MichelsonTypeMapping => notSupported('timestamp'),
  address: (...args: unknown[]): MichelsonTypeMapping => MichelsonAddress.from(...args),
  key: (): MichelsonTypeMapping => notSupported('key'),
  unit: (...args: unknown[]): MichelsonTypeMapping => MichelsonUnit.from(...args),
  signature: (): MichelsonTypeMapping => notSupported('signature'),
  option: (...args: unknown[]): MichelsonTypeMapping => MichelsonOption.from(...args),
  list: (...args: unknown[]): MichelsonTypeMapping => MichelsonList.from(...args),
  set: (): MichelsonTypeMapping => notSupported('set'),
  operation: (): MichelsonTypeMapping => notSupported('operation'),
  contract: (...args: unknown[]): MichelsonTypeMapping => MichelsonAddress.from(...args),
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