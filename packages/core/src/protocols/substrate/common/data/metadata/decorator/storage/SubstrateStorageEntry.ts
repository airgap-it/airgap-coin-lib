// tslint:disable: max-classes-per-file
import { zippedArrays } from '../../../../../../../utils/array'
import { blake2bAsHex } from '../../../../../../../utils/blake2b'
import { bytesToHex } from '../../../../../../../utils/hex'
import { xxhashAsHex } from '../../../../../../../utils/xxhash'
import { SCALEType } from '../../../scale/type/SCALEType'

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
  private readonly storageHash: Map<string, string> = new Map()

  public constructor(public readonly palletName: string, public readonly prefix: string) {}

  public async hash(...args: SCALEType[]): Promise<string> {
    const rawKey = this.palletName + this.prefix + (await this.argsToKeys(args))

    if (!this.storageHash.get(rawKey)) {
      const prefixTrie = await this.hashPrefixTrie()
      const itemHash = await this.hashArgs(args)

      this.storageHash.set(rawKey, prefixTrie + itemHash)
    }

    return this.storageHash.get(rawKey)!
  }

  protected abstract argsToKeys(args: SCALEType[]): Promise<string>
  protected abstract hashArgs(args: SCALEType[]): Promise<string>

  private async hashPrefixTrie(): Promise<string> {
    const moduleHash = xxhashAsHex(this.palletName, PREFIX_TRIE_HASH_SIZE)
    const storageHash = xxhashAsHex(this.prefix, PREFIX_TRIE_HASH_SIZE)

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
  public constructor(pallet: string, prefix: string, public readonly hasher: SubstrateStorageEntryHasher) {
    super(pallet, prefix)
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
  public constructor(
    pallet: string,
    prefix: string,
    public readonly firstHasher: SubstrateStorageEntryHasher,
    public readonly secondHasher: SubstrateStorageEntryHasher
  ) {
    super(pallet, prefix)
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

export class SubstrateNMapStorageEntry extends SubstrateStorageEntry {
  public constructor(pallet: string, prefix: string, public readonly hashers: SubstrateStorageEntryHasher[]) {
    super(pallet, prefix)
  }

  protected async argsToKeys(args: SCALEType[]): Promise<string> {
    return args.reduce((key: string, next: SCALEType) => key + bytesToHex(next.encode()), '')
  }

  protected async hashArgs(args: SCALEType[]): Promise<string> {
    try {
      const zipped: [SubstrateStorageEntryHasher, SCALEType][] = zippedArrays(this.hashers, args)

      const hashes: string[] = await Promise.all(
        zipped.map(([hasher, arg]: [SubstrateStorageEntryHasher, SCALEType]) => {
          const hasherMethod = hasherMethods.get(hasher)
          if (hasherMethod === undefined) {
            throw new Error()
          }

          return hasherMethod(arg.encode())
        })
      )

      return hashes.reduce((hash: string, next: string) => hash + next, '')
    } catch (error) {
      console.warn(error)
      return ''
    }
  }
}
