import { MichelsonList } from './generics/MichelsonList'
import { MichelsonMap } from './generics/MichelsonMap'
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

export class MichelsonTypeUtils {
  public static readonly literalPrefixes: {
    int: Buffer
    string: Buffer
    bytes: Buffer
  } = {
    int: Buffer.from(new Uint8Array([0])),
    string: Buffer.from(new Uint8Array([1])),
    bytes: Buffer.from(new Uint8Array([10]))
  }

  public static readonly primPrefixes: {
    pair: Buffer
  } = {
    pair: Buffer.from(new Uint8Array([7]))
  }

  public static readonly sequencePrefixes: {
    list: Buffer
  } = {
    list: Buffer.from(new Uint8Array([2]))
  }

  private static readonly michelsonTypeFactories: Record<MichelsonGrammarType, (...args: unknown[]) => MichelsonType> = {
    nat: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
    int: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
    string: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
    bytes: (...args: unknown[]): MichelsonType => MichelsonBytes.from(args[0]),
    mutez: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
    bool: (...args: unknown[]): MichelsonType => MichelsonBool.from(args[0]),
    key_hash: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
    timestamp: (...args: unknown[]): MichelsonType => notSupported('timestamp', args),
    address: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
    key: (...args: unknown[]): MichelsonType => notSupported('key', args),
    unit: (...args: unknown[]): MichelsonType => MichelsonUnit.from(args[0]),
    signature: (...args: unknown[]): MichelsonType => notSupported('signature', args),
    option: (...args: unknown[]): MichelsonType => MichelsonOption.from(args[0], args[1]),
    list: (...args: unknown[]): MichelsonType => MichelsonList.from(args[0], args[1]),
    set: (...args: unknown[]): MichelsonType => MichelsonList.from(args[0], args[1]),
    operation: (...args: unknown[]): MichelsonType => notSupported('operation', args),
    contract: (...args: unknown[]): MichelsonType => MichelsonAddress.from(args[0]),
    pair: (...args: unknown[]): MichelsonType => MichelsonPair.from(args[0], undefined, ...args.splice(1)),
    or: (...args: unknown[]): MichelsonType => MichelsonOr.from(args[0], args[1], args[2]),
    lambda: (...args: unknown[]): MichelsonType => MichelsonString.from(args[0]),
    map: (...args: unknown[]): MichelsonType => MichelsonMap.from(args[0], args[1], args[2]),
    big_map: (...args: unknown[]): MichelsonType => MichelsonInt.from(args[0]),
    chain_id: (...args: unknown[]): MichelsonType => notSupported('chain_id', args),
    sapling_transaction: (...args: unknown[]): MichelsonType => MichelsonBytes.from(args[0])
  }

  public static create(type: MichelsonGrammarType, ...args: unknown[]): MichelsonType {
    return MichelsonTypeUtils.michelsonTypeFactories[type](...args)
  }
}

function notSupported(type: MichelsonGrammarType, args: unknown[]): MichelsonType {
  const value = args.reduce((joined, next) => `${joined}-${next}`, '')
  return MichelsonString.from(value)
}
