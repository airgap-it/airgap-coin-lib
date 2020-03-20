import { bytesToHex } from '../../../utils/hex'
import { xxhashAsHex } from '../../../utils/xxhash'
import { blake2bAsHex } from '../../../utils/blake2b'

type HasherMethod = (value: (string | Uint8Array)) => Promise<string>

export interface PolkadotStorageKey {
    hasher?: PolkadotStorageHasher | null
    value: Uint8Array | string
}

export interface PolkadotStorageKeys {
    moduleName: string
    storageName: string
    firstKey?: PolkadotStorageKey
    secondKey?: PolkadotStorageKey
}

export enum PolkadotStorageHasher {
    BLAKE2_128 = 0, 
    BLAKE2_256,  
    BLAKE2_128_CONCAT,
    TWOX128,
    TWOX256,
    TWOX64_CONCAT,
    IDENTITY,
}

const PREFIX_TRIE_HASH_SIZE = 128

export class PolkadotStorageUtils {
    private readonly storageHash: Map<string, string> = new Map()
    private readonly hasherMethods: HasherMethod[] = new Array(Object.keys(PolkadotStorageHasher).length)

    constructor() {
        this.initHasherMethods()
    }

    public async getHash({ moduleName, storageName, firstKey, secondKey }: PolkadotStorageKeys): Promise<string> {
        const rawKey = moduleName + storageName + bytesToHex(firstKey?.value || '') + bytesToHex(secondKey?.value || '')

        if (!this.storageHash[rawKey]) {
            const prefixTrie = await this.generatePrefixTrie(moduleName, storageName)
            const itemHash = await this.generateItemHash(firstKey, secondKey)

            this.storageHash[rawKey] = prefixTrie + itemHash
        }

        return this.storageHash[rawKey]
    }

    private async generatePrefixTrie(moduleName: string, storageName: string): Promise<string> {
        const moduleHash = xxhashAsHex(moduleName, PREFIX_TRIE_HASH_SIZE)
        const storageHash = xxhashAsHex(storageName, PREFIX_TRIE_HASH_SIZE)
        
        return moduleHash + storageHash
    }

    private async generateItemHash(firstKey?: PolkadotStorageKey, secondKey?: PolkadotStorageKey): Promise<string> {
        const firstKeyHash = await this.generateKeyHash(firstKey)
        const secondKeyHash = await this.generateKeyHash(secondKey)

        return firstKeyHash + secondKeyHash
    }

    private async generateKeyHash(key?: PolkadotStorageKey): Promise<string> {
        if (!key || key.hasher === undefined || key.hasher === null) {
            return ''
        }

        const hasherMethod = this.hasherMethods[key.hasher]
        return hasherMethod ? await hasherMethod(key.value) : ''
    }

    private initHasherMethods() {
        this.hasherMethods[PolkadotStorageHasher.BLAKE2_128] = 
            async (value: string | Uint8Array) => blake2bAsHex(value, 128)

        this.hasherMethods[PolkadotStorageHasher.BLAKE2_256] = 
            async (value: string | Uint8Array) => blake2bAsHex(value, 256)

        this.hasherMethods[PolkadotStorageHasher.BLAKE2_128_CONCAT] = 
            async (value: string | Uint8Array) => blake2bAsHex(value, 128) + bytesToHex(value)
            
        this.hasherMethods[PolkadotStorageHasher.TWOX128] = 
            async (value: string | Uint8Array) => xxhashAsHex(value, 128)

        this.hasherMethods[PolkadotStorageHasher.TWOX256] = 
            async (value: string | Uint8Array) => xxhashAsHex(value, 256)

        this.hasherMethods[PolkadotStorageHasher.TWOX64_CONCAT] = 
            async (value: string | Uint8Array) => xxhashAsHex(value, 64) + bytesToHex(value)

        this.hasherMethods[PolkadotStorageHasher.IDENTITY] = 
            async (value: string | Uint8Array) => bytesToHex(value)
    }
}