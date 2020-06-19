import { MichelineNode } from '../micheline/MichelineNode'

import { MichelsonBool } from './MichelsonBool'
import { MichelsonBytes } from './MichelsonBytes'
import { MichelsonInt } from './MichelsonInt'
import { MichelsonList } from './MichelsonList'
import { MichelsonString } from './MichelsonString'
import { MichelsonUnit } from './MichelsonUnit'

export const michelsonTypeMappings = {
  nat: (...args) => MichelsonInt.from(...args),
  int: (...args) => MichelsonInt.from(...args),
  string: (...args) => MichelsonString.from(...args),
  bytes: (...args) => MichelsonBytes.from(...args),
  mutez: () => { notSupported('mutez') },
  bool: (...args) => MichelsonBool.from(...args),
  key_hash: () => { notSupported('key_hash') },
  timestamp: () => { notSupported('timestamp') },
  address: (...args) => MichelsonString.from(...args),
  key: () => { notSupported('key') },
  unit: (...args) => MichelsonUnit.from(...args),
  signature: () => { notSupported('signature') },
  option: () => { notSupported('option') },
  list: (...args) => MichelsonList.from(...args),
  set: () => { notSupported('set') },
  operation: () => { notSupported('operation') },
  contract: () => { notSupported('contract') },
  pair: () => { notSupported('pair') },
  or: () => { notSupported('or') },
  lambda: () => { notSupported('lambda') },
  map: () => { notSupported('map') },
  big_map: () => { notSupported('big_map') },
  chain_id: () => { notSupported('chain_id') },
}

export type MichelsonType = keyof typeof michelsonTypeMappings

export abstract class MichelsonTypeMapping {
  public abstract toMichelineJSON(): MichelineNode
}

function notSupported(type: MichelsonType): MichelsonTypeMapping {
  throw new Error(`Michelson type ${type} is not supported.`)
}