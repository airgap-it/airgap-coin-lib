import { MichelsonType, MichelsonTypeMap, MichelsonTypeMapping, MichelsonNat, MichelsonInt, MichelsonString, MichelsonBytes, MichelsonBool } from './types'

type MappingFactory<T extends MichelsonType> = 
  (annotations?: string[], args?: MichelsonTypeMapping | MichelsonTypeMapping[]) => MichelsonTypeMap[T]
const mappingFactories: Record<MichelsonType, MappingFactory<any>> = {
  nat: MichelsonNat.from,
  int: () => MichelsonInt.from,
  string: () => MichelsonString.from,
  bytes: () => MichelsonBytes.from,
  mutez: () => { notSupported('mutez') },
  bool: () => MichelsonBool.from,
  key_hash: () => { notSupported('key_hash') },
  timestamp: () => { notSupported('timestamp') },
  address: () => { notSupported('address') },
  key: () => { notSupported('key') },
  unit: () => { notSupported('unit') },
  signature: () => { notSupported('signature') },
  option: () => { notSupported('option') },
  list: () => { notSupported('list') },
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

export function createMichelsonMapping<T extends MichelsonType>(
  type: T, 
  annotations: string[] = [], 
  args: MichelsonTypeMapping | MichelsonTypeMapping[] = []
): MichelsonTypeMap[T] {
  const factory: MappingFactory<T> = mappingFactories[type]

  return factory(annotations, args)
}

function notSupported(type: string): void {
  throw new Error(`Michelson type ${type} is not supported.`)
}