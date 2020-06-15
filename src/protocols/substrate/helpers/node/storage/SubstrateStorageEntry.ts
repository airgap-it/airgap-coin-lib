import { blake2bAsHex } from '../../../../../utils/blake2b'
import { bytesToHex } from '../../../../../utils/hex'
import { xxhashAsHex } from '../../../../../utils/xxhash'
import {
  MetadataStorageEntryDoubleMap,
  MetadataStorageEntryMap,
  MetadataStorageEntryPlain,
  MetadataStorageEntryType
} from '../../data/metadata/module/storage/MetadataStorageEntryType'
import { SCALEType } from '../../data/scale/type/SCALEType'

export enum SubstrateStorageEntryHasher {
  BLAKE2_128 = 0,
  BLAKE2_256,
  BLAKE2_128_CONCAT,
  TWOX128,
  TWOX256,
  TWOX64_CONCAT,
  IDENTITY
}

const hasherMethods = new Map([
  [SubstrateStorageEntryHasher.BLAKE2_128, async (value: string | Uint8Array) => blake2bAsHex(value, 128)],
  [SubstrateStorageEntryHasher.BLAKE2_256, async (value: string | Uint8Array) => blake2bAsHex(value, 256)],
  [SubstrateStorageEntryHasher.BLAKE2_128_CONCAT, async (value: string | Uint8Array) => blake2bAsHex(value, 128) + bytesToHex(value)],
  [SubstrateStorageEntryHasher.TWOX128, async (value: string | Uint8Array) => xxhashAsHex(value, 128)],
  [SubstrateStorageEntryHasher.TWOX256, async (value: string | Uint8Array) => xxhashAsHex(value, 256)],
  [SubstrateStorageEntryHasher.TWOX64_CONCAT, async (value: string | Uint8Array) => xxhashAsHex(value, 64) + bytesToHex(value)],
  [SubstrateStorageEntryHasher.IDENTITY, async (value: string | Uint8Array) => bytesToHex(value)]
])

const PREFIX_TRIE_HASH_SIZE = 128
export abstract class SubstrateStorageEntry {
  public static fromMetadata(entryType: MetadataStorageEntryType): SubstrateStorageEntry {
    if (entryType instanceof MetadataStorageEntryPlain) {
      return new SubstratePlainStorageEntry()
    }
    if (entryType instanceof MetadataStorageEntryMap) {
      return new SubstrateMapStorageEntry(entryType.hasher.value)
    }
    if (entryType instanceof MetadataStorageEntryDoubleMap) {
      return new SubstrateDoubleMapStorageEntry(entryType.hasher1.value, entryType.hasher2.value)
    }

    throw new Error('Unknown storage entry type.')
  }

  private readonly storageHash: Map<string, string> = new Map()

  public async hash(module: string, prefix: string, ...args: SCALEType[]): Promise<string> {
    const rawKey = module + prefix + (await this.argsToKeys(args))

    if (!this.storageHash.get(rawKey)) {
      const prefixTrie = await this.hashPrefixTrie(module, prefix)
      const itemHash = await this.hashArgs(args)

      this.storageHash.set(rawKey, prefixTrie + itemHash)
    }

    return this.storageHash.get(rawKey)!
  }

  protected abstract argsToKeys(args: SCALEType[]): Promise<string>
  protected abstract hashArgs(args: SCALEType[]): Promise<string>

  private async hashPrefixTrie(module: string, prefix: string): Promise<string> {
    const moduleHash = xxhashAsHex(module, PREFIX_TRIE_HASH_SIZE)
    const storageHash = xxhashAsHex(prefix, PREFIX_TRIE_HASH_SIZE)

    return moduleHash + storageHash
  }
}

export class SubstratePlainStorageEntry extends SubstrateStorageEntry {
  protected async argsToKeys(args: SCALEType[]): Promise<string> {
    return ''
  }

  protected async hashArgs(args: SCALEType[]): Promise<string> {
    return ''
  }
}

export class SubstrateMapStorageEntry extends SubstrateStorageEntry {
  public constructor(public readonly hasher: SubstrateStorageEntryHasher) {
    super()
  }

  protected async argsToKeys(args: SCALEType[]): Promise<string> {
    return bytesToHex(args[0].encode())
  }

  protected async hashArgs(args: SCALEType[]): Promise<string> {
    const hasherMethod = hasherMethods.get(this.hasher)

    return hasherMethod ? hasherMethod(args[0].encode()) : ''
  }
}

export class SubstrateDoubleMapStorageEntry extends SubstrateStorageEntry {
  public constructor(public readonly firstHasher: SubstrateStorageEntryHasher, public readonly secondHasher: SubstrateStorageEntryHasher) {
    super()
  }

  protected async argsToKeys(args: SCALEType[]): Promise<string> {
    return bytesToHex(args[0].encode()) + bytesToHex(args[1].encode())
  }

  protected async hashArgs(args: SCALEType[]): Promise<string> {
    const firstHasherMethod = hasherMethods.get(this.firstHasher)
    const secondHasherMethod = hasherMethods.get(this.secondHasher)

    return firstHasherMethod && secondHasherMethod
      ? Promise.all([firstHasherMethod(args[0].encode()), secondHasherMethod(args[1].encode())]).then(
          ([firstHash, secondHash]) => firstHash + secondHash
        )
      : ''
  }
}
