import axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { RPCBody } from '../../data/RPCBody'
import { xxhashAsHex } from '../../utils/xxhash'
import { blake2bAsHex } from '../../utils/blake2b'
import { hexToBigNumber } from '../../utils/hex'
import { decodeAddress } from './utils/address'

const RPC_ENDPOINTS = {
    GET_METADATA: 'state_getMetadata',
    GET_STORAGE: 'state_getStorage',
    SUBMIT_EXTRINSIC: 'author_submitExtrinsic'
}

class StorageKeyUtil {
    private static readonly PREFIX_TRIE_HASH_SIZE = 128
    private static readonly ITEM_HASH_SIZE = 256

    private readonly storageKeys: { [id: string] : string } = {}

    public getKey(moduleName: string, storageName: string, firstKey: Uint8Array | string | null = null, secondKey: Uint8Array | string | null = null): string {
        const rawKey = moduleName + storageName + (firstKey || '') + (secondKey || '')

        if (!this.storageKeys[rawKey]) {
            this.storageKeys[rawKey] = '0x' + this.generatePrefixTrie(moduleName, storageName) + this.generateItemHash(firstKey, secondKey)
        }

        return this.storageKeys[rawKey]
    }

    private generatePrefixTrie(moduleName: string, storageName: string): string {
        const moduleHash = xxhashAsHex(moduleName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        const storageHash = xxhashAsHex(storageName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        
        return moduleHash + storageHash
    }

    private generateItemHash(firstKey: Uint8Array | string | null, secondKey: Uint8Array | string | null): string {
        const firstKeyHash = firstKey ? blake2bAsHex(firstKey, StorageKeyUtil.ITEM_HASH_SIZE) : ''
        const secondKeyHash = secondKey ? blake2bAsHex(secondKey, StorageKeyUtil.ITEM_HASH_SIZE) : ''

        return firstKeyHash + secondKeyHash
    }
}

export class PolkadotNodeClient {

    constructor(
        private readonly baseURL: string, 
        private readonly storageKeyUtil: StorageKeyUtil = new StorageKeyUtil()
    ) {}

    public getBalance(address: string): Promise<BigNumber> {
        return this.send<BigNumber, (string | null)>(
            RPC_ENDPOINTS.GET_STORAGE, 
            [this.storageKeyUtil.getKey('Balances', 'FreeBalance', decodeAddress(address))], 
            result => hexToBigNumber(result, { littleEndian: true })
        )
    }

    private async send<T, R>(method: string, params: any[], resultHandler: (result: R) => T): Promise<T> {
        const response: AxiosResponse = await axios.post(this.baseURL, new RPCBody(method, params))

        return resultHandler(response.data.result)
    }
}