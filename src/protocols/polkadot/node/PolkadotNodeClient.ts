import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { RPCBody } from '../../../data/RPCBody'
import { xxhashAsHex } from '../../../utils/xxhash'
import { blake2bAsHex } from '../../../utils/blake2b'
import { stripHexPrefix, toHexString, addHexPrefix, bytesToHex } from '../../../utils/hex'
import { PolkadotTransactionType } from '../transaction/data/PolkadotTransaction'
import { PolkadotNominations } from '../staking/PolkadotNominations'
import { 
    PolkadotValidatorDetails, 
    PolkadotValidatorPrefs, 
    PolkadotValidatorIdentity, 
    PolkadotValidatorStatus, 
    PolkadotExposure 
} from '../staking/PolkadotValidatorDetails'
import { Metadata, ExtrinsicId } from './metadata/Metadata'
import { SCALEInt } from './codec/type/SCALEInt'
import { SCALEArray } from './codec/type/SCALEArray'
import { SCALEAccountId } from './codec/type/SCALEAccountId'
import { PolkadotAccountInfo } from '../account/data/PolkadotAccountInfo'
import { PolkadotAddress } from '../account/PolkadotAddress'

const RPC_ENDPOINTS = {
    GET_METADATA: 'state_getMetadata',
    GET_STORAGE: 'state_getStorage',
    GET_BLOCK: 'chain_getBlock',
    GET_BLOCK_HASH: 'chain_getBlockHash',
    GET_RUNTIME_VERSION: 'state_getRuntimeVersion',
    GET_QUERY_INFO: 'payment_queryInfo',
    SUBMIT_EXTRINSIC: 'author_submitExtrinsic'
}

const RPC_EXTRINSIC = {
    TRANSFER: 'balances_transfer',
    BOND: 'staking_bond',
    UNBOND: 'staking_unbond',
    BOND_EXTRA: 'staking_bond_extra',
    WITHDRAW_UNBONDED: 'staking_withdraw_unbonded',
    NOMINATE: 'staking_nominate',
    CHILL: 'staking_chill',
    SET_PAYEE: 'staking_set_payee',
    SET_CONTROLLER: 'staking_set_controller'
}

const methodEndpoints: Map<PolkadotTransactionType, string> = new Map([
    [PolkadotTransactionType.TRANSFER, RPC_EXTRINSIC.TRANSFER],
    [PolkadotTransactionType.BOND, RPC_EXTRINSIC.BOND],
    [PolkadotTransactionType.UNBOND, RPC_EXTRINSIC.UNBOND],
    [PolkadotTransactionType.BOND_EXTRA, RPC_EXTRINSIC.BOND_EXTRA],
    [PolkadotTransactionType.WITHDRAW_UNBONDED, RPC_EXTRINSIC.WITHDRAW_UNBONDED],
    [PolkadotTransactionType.NOMINATE, RPC_EXTRINSIC.NOMINATE],
    [PolkadotTransactionType.STOP_NOMINATING, RPC_EXTRINSIC.CHILL],
    [PolkadotTransactionType.SET_PAYEE, RPC_EXTRINSIC.SET_PAYEE],
    [PolkadotTransactionType.SET_CONTROLLER, RPC_EXTRINSIC.SET_CONTROLLER]
])

enum StorageHasher {
    BLAKE2_256,
    TWOX64_CONCAT
}

interface StorageKey {
    hasher: StorageHasher
    value: Uint8Array | string
}

interface StorageKeys {
    moduleName: string
    storageName: string
    firstKey?: StorageKey
    secondKey?: StorageKey
}

class StorageKeyUtil {
    private static readonly PREFIX_TRIE_HASH_SIZE = 128

    private static readonly ITEM_BLAKE2_256_HASH_SIZE = 256
    private static readonly ITEM_TWOX64_HASH_SIZE = 64

    private readonly storageHash: Map<string, string> = new Map()

    public async getHash({ moduleName, storageName, firstKey, secondKey }: StorageKeys): Promise<string> {
        const rawKey = moduleName + storageName + bytesToHex(firstKey?.value || '') + bytesToHex(secondKey?.value || '')

        if (!this.storageHash[rawKey]) {
            const prefixTrie = await this.generatePrefixTrie(moduleName, storageName)
            const itemHash = await this.generateItemHash(firstKey, secondKey)

            this.storageHash[rawKey] = prefixTrie + itemHash
        }

        return this.storageHash[rawKey]
    }

    private async generatePrefixTrie(moduleName: string, storageName: string): Promise<string> {
        const moduleHash = await xxhashAsHex(moduleName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        const storageHash = await xxhashAsHex(storageName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        
        return moduleHash + storageHash
    }

    private async generateItemHash(firstKey?: StorageKey, secondKey?: StorageKey): Promise<string> {
        const firstKeyHash = await this.generateKeyHash(firstKey)
        const secondKeyHash = await this.generateKeyHash(secondKey)

        return firstKeyHash + secondKeyHash
    }

    private async generateKeyHash(key?: StorageKey): Promise<string> {
        switch (key?.hasher) {
            case StorageHasher.BLAKE2_256:
                return blake2bAsHex(key.value, StorageKeyUtil.ITEM_BLAKE2_256_HASH_SIZE)                
            case StorageHasher.TWOX64_CONCAT:
                return await xxhashAsHex(key.value, StorageKeyUtil.ITEM_TWOX64_HASH_SIZE) + bytesToHex(key.value)
            default:
                return ''
        }
    }
}

export class PolkadotNodeClient {
    private metadata: Metadata | null = null

    constructor(
        private readonly baseURL: string, 
        private readonly storageKeyUtil: StorageKeyUtil = new StorageKeyUtil()
    ) {}

    public async getBalance(address: PolkadotAddress): Promise<BigNumber> {
        const accountInfo = await this.getAccountInfo(address)

        return accountInfo?.data.free.value || new BigNumber(0)
    }

    public async getTransactionMetadata(type: PolkadotTransactionType): Promise<ExtrinsicId | null> {
        const rpcEndpoint = methodEndpoints.get(type) || ''
        try {
            if (!this.metadata) {
                await this.fetchMetadata()
            }

            return (this.metadata && this.metadata.hasExtrinsicId(rpcEndpoint)) 
                ? this.metadata!.getExtrinsicId(rpcEndpoint) 
                : null
        } catch (e) {
            return null
        }
    }

    public getTransferFeeEstimate(transactionBytes: Uint8Array | string): Promise<BigNumber | null> {
        return this.send<BigNumber | null, any | null>(
            RPC_ENDPOINTS.GET_QUERY_INFO,
            [bytesToHex(transactionBytes)],
            result => result ? new BigNumber(result.partialFee) : null
        )
    }

    public async getNonce(address: PolkadotAddress): Promise<BigNumber> {
        const accountInfo = await this.getAccountInfo(address)

        return accountInfo?.nonce.value || new BigNumber(0)
    }

    public getFirstBlockHash(): Promise<string | null> {
        return this.getBlockHash(0)
    }

    public getLastBlockHash(): Promise<string | null> {
        return this.getBlockHash()
    }

    public getCurrentHeight(): Promise<BigNumber> {
        return this.send<BigNumber, any>(
            RPC_ENDPOINTS.GET_BLOCK,
            [],
            result => new BigNumber(stripHexPrefix(result.block.header.number), 16)
        )
    }

    public getCurrentEraIndex(): Promise<BigNumber | null> {
        return this.getFromStorage<BigNumber | null>(
            { 
                moduleName: 'Staking', 
                storageName: 'CurrentEra' 
            },
            result => result ? SCALEInt.decode(result).decoded.value : null
        )
    }

    public getSpecVersion(): Promise<number> {
        return this.send<number, any>(
            RPC_ENDPOINTS.GET_RUNTIME_VERSION,
            [],
            result => result.specVersion
        )
    }

    public getBonded(address: PolkadotAddress): Promise<PolkadotAddress | null> {
        return this.getFromStorage<PolkadotAddress | null>(
            {
                moduleName: 'Staking',
                storageName: 'Bonded',
                firstKey: {
                    hasher: StorageHasher.BLAKE2_256,
                    value: address.getBufferPublicKey()
                }
            },
            result => result ? SCALEAccountId.decode(result).decoded.address : null
        )
    }

    public getNominations(address: PolkadotAddress): Promise<PolkadotNominations | null> {
        return this.getFromStorage<PolkadotNominations | null>(
            { 
                moduleName: 'Staking',
                storageName: 'Nominators', 
                firstKey: { 
                    hasher: StorageHasher.BLAKE2_256, 
                    value: address.getBufferPublicKey()
                } 
            },
            result => result ? PolkadotNominations.decode(result) : null
        )
    }

    public getValidators(): Promise<PolkadotAddress[] | null> {
        return this.getFromStorage<PolkadotAddress[] | null>(
            { 
                moduleName: 'Session', 
                storageName: 'Validators'
             },
            result => result ? SCALEArray.decode(result, SCALEAccountId.decode).decoded.elements.map(encoded => encoded.address) : null
        )
    }

    public async getValidatorDetails(address: PolkadotAddress): Promise<PolkadotValidatorDetails> {
        const results = await Promise.all([
            this.getFromStorage<PolkadotValidatorIdentity | null>(
                { 
                    moduleName: 'Sudo', 
                    storageName: 'IdentityOf', 
                    firstKey: { 
                        hasher: StorageHasher.BLAKE2_256, 
                        value: address.getBufferPublicKey()
                    } 
                },
                result => result ? PolkadotValidatorIdentity.decode(result) : null
            ),
            this.getValidators(),
            this.getFromStorage<PolkadotValidatorPrefs | null>(
                { 
                    moduleName: 'Staking', 
                    storageName: 'Validators', 
                    firstKey: { 
                        hasher: StorageHasher.BLAKE2_256, 
                        value: address.getBufferPublicKey()
                    } 
                },
                result => result ? PolkadotValidatorPrefs.decode(result) : null
            )
        ])

        const identity = results[0]
        const currentValidators = results[1]
        const prefs = results[2]

        let status: PolkadotValidatorStatus | null
        // TODO: check if reaped
        if (!currentValidators) {
            status = null
        } else if (currentValidators.find(current => current.compare(address) == 0)) {
            status = PolkadotValidatorStatus.ACTIVE
        } else {
            status = PolkadotValidatorStatus.INACTIVE
        }

        const exposure = await this.getValidatorExposure(address)
        
        return {
            name: identity ? identity.display.value : null,
            status,
            ownStash: exposure ? exposure.ownStash.value : null,
            totalStakingBalance: exposure ? exposure.totalBalance.value : null,
            commission: prefs ? prefs.commission.value.dividedBy(1_000_000_000) : null // commission is Perbill (parts per billion)
        }
    }

    public submitTransaction(encoded: string): Promise<string> {
        return this.send<string, string>(
            RPC_ENDPOINTS.SUBMIT_EXTRINSIC,
            [encoded]
        )
    }

    private async fetchMetadata(): Promise<void> {
        this.metadata = await this.send<(Metadata | null), string>(
            RPC_ENDPOINTS.GET_METADATA,
            [],
            result => result ? Metadata.decode(result) : null
        )
    }

    private async getAccountInfo(address: PolkadotAddress): Promise<PolkadotAccountInfo | null> {
        return this.getFromStorage<PolkadotAccountInfo | null>(
            { 
                moduleName: 'System', 
                storageName: 'Account', 
                firstKey: { 
                    hasher: StorageHasher.BLAKE2_256, 
                    value: address.getBufferPublicKey()
                } 
            },
            result => result ? PolkadotAccountInfo.decode(result) : null
        )
    }

    private async getBlockHash(blockNumber?: number): Promise<string | null> {
        return this.send<string, string>(
            RPC_ENDPOINTS.GET_BLOCK_HASH,
            blockNumber !== undefined ? [toHexString(blockNumber)] : []
        )
    }

    private async getValidatorExposure(address: PolkadotAddress): Promise<PolkadotExposure | null> {
        const eraIndex = await this.getCurrentEraIndex() || 0

        return this.getFromStorage(
            { 
                moduleName: 'Staking', 
                storageName: 'ErasStakers', 
                firstKey: { 
                    hasher: StorageHasher.TWOX64_CONCAT, 
                    value: SCALEInt.from(eraIndex, 32).encode() 
                }, 
                secondKey: { 
                    hasher: StorageHasher.TWOX64_CONCAT, 
                    value: address.getBufferPublicKey()
                } 
            },
            result => result ? PolkadotExposure.decode(result) : null
        )
    }

    private async getFromStorage<T>(storageKeys: StorageKeys, resultHandler?: (result: string | null) => T): Promise<T> {
        return this.send<T, string>(
            RPC_ENDPOINTS.GET_STORAGE,
            [await this.storageKeyUtil.getHash(storageKeys)],
            resultHandler
        )
    }

    private async send<T, R>(method: string, params: string[], resultHandler?: (result: R | null) => T): Promise<T> {
        const response: AxiosResponse = await axios.post(this.baseURL, new RPCBody(method, params.map(param => addHexPrefix(param))))
        
        return resultHandler ? resultHandler(response.data.result) : response.data.result
    }
}