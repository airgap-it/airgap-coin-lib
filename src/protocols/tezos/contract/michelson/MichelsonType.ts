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
  nat: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(args[0]),
  int: (...args: unknown[]): MichelsonTypeMapping => MichelsonInt.from(args[0]),
  string: (...args: unknown[]): MichelsonTypeMapping => MichelsonString.from(args[0]),
  bytes: (...args: unknown[]): MichelsonTypeMapping => MichelsonBytes.from(args[0]),
  mutez: (): MichelsonTypeMapping => notSupported('mutez'),
  bool: (...args: unknown[]): MichelsonTypeMapping => MichelsonBool.from(args[0]),
  key_hash: (): MichelsonTypeMapping => notSupported('key_hash'),
  timestamp: (): MichelsonTypeMapping => notSupported('timestamp'),
  address: (...args: unknown[]): MichelsonTypeMapping => MichelsonAddress.from(args[0]),
  key: (): MichelsonTypeMapping => notSupported('key'),
  unit: (...args: unknown[]): MichelsonTypeMapping => MichelsonUnit.from(args[0]),
  signature: (): MichelsonTypeMapping => notSupported('signature'),
  option: (...args: unknown[]): MichelsonTypeMapping => MichelsonOption.from(args[0], args[1]),
  list: (...args: unknown[]): MichelsonTypeMapping => MichelsonList.from(args[0], args[1]),
  set: (): MichelsonTypeMapping => notSupported('set'),
  operation: (): MichelsonTypeMapping => notSupported('operation'),
  contract: (...args: unknown[]): MichelsonTypeMapping => MichelsonAddress.from(args[0]),
  pair: (...args: unknown[]): MichelsonTypeMapping => MichelsonPair.from(args[0], args[1], args[2]),
  or: (...args: unknown[]): MichelsonTypeMapping => MichelsonOr.from(args[0], args[1], args[2]),
  lambda: (): MichelsonTypeMapping => notSupported('lambda'),
  map: (): MichelsonTypeMapping => notSupported('map'),
  big_map: (): MichelsonTypeMapping => notSupported('big_map'),
  chain_id: (): MichelsonTypeMapping => notSupported('chain_id'),
}

export type MichelsonType = keyof typeof michelsonTypeFactories

function notSupported(type: MichelsonType): MichelsonTypeMapping {
  throw new Error(`Michelson type ${type} is not supported.`)
}