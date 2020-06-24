import { MichelsonList } from './generics/MichelsonList'
import { MichelsonOption } from './generics/MichelsonOption'
import { MichelsonOr } from './generics/MichelsonOr'
import { MichelsonPair } from './generics/MichelsonPair'
import { MichelsonGrammarType } from './grammar/MichelsonGrammarType'
import { MichelsonType } from './MichelsonType'
import { MichelsonAddress } from './primitives/MichelsonAddress'
import { MichelsonBool } from './primitives/MichelsonBool'
import { MichelsonBytes } from './primitives/MichelsonBytes'
import { MichelsonInt } from './primitives/MichelsonInt'
import { MichelsonString } from './primitives/MichelsonString'
import { MichelsonUnit } from './primitives/MichelsonUnit'

export const michelsonTypeFactories: Record<MichelsonGrammarType, (...args: unknown[]) => MichelsonType> = {
  nat: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
  int: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
  string: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
  bytes: (...args: unknown[]): MichelsonType => MichelsonBytes.from(args[0]),
  mutez: (): MichelsonType => notSupported('mutez'),
  bool: (...args: unknown[]): MichelsonType => MichelsonBool.from(args[0]),
  key_hash: (): MichelsonType => notSupported('key_hash'),
  timestamp: (): MichelsonType => notSupported('timestamp'),
  address: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
  key: (): MichelsonType => notSupported('key'),
  unit: (...args: unknown[]): MichelsonType => MichelsonUnit.from(args[0]),
  signature: (): MichelsonType => notSupported('signature'),
  option: (...args: unknown[]): MichelsonType => MichelsonOption.from(args[0], args[1]),
  list: (...args: unknown[]): MichelsonType => MichelsonList.from(args[0], args[1]),
  set: (): MichelsonType => notSupported('set'),
  operation: (): MichelsonType => notSupported('operation'),
  contract: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
  pair: (...args: unknown[]): MichelsonType => MichelsonPair.from(args[0], args[1], args[2]),
  or: (...args: unknown[]): MichelsonType => MichelsonOr.from(args[0], args[1], args[2]),
  lambda: (): MichelsonType => notSupported('lambda'),
  map: (): MichelsonType => notSupported('map'),
  big_map: (): MichelsonType => notSupported('big_map'),
  chain_id: (): MichelsonType => notSupported('chain_id'),
}

function notSupported(type: MichelsonGrammarType): MichelsonType {
  throw new Error(`Michelson type ${type} is not supported.`)
}