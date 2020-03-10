import axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { RPCBody } from '../../data/RPCBody'
import { xxhashAsHex } from '../../utils/xxhash'
import { blake2bAsHex } from '../../utils/blake2b'
import { stripHexPrefix, toHexString, addHexPrefix } from '../../utils/hex'
import { isString } from 'util'
import { PolkadotTransactionType } from './transaction/PolkadotTransaction'
import { Metadata, ExtrinsicId } from './metadata/Metadata'
import { SCALEInt } from './codec/type/SCALEInt'
import { PolkadotNominations } from './staking/PolkadotNominations'
import { PolkadotValidatorDetails, PolkadotValidatorPrefs, PolkadotValidatorIdentity, PolkadotValidatorStatus, PolkadotExposure } from './staking/PolkadotValidatorDetails'
import { SCALEArray } from './codec/type/SCALEArray'
import { SCALEAccountId } from './codec/type/SCALEAccountId'

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
    NOMINATE: 'staking_nominate',
    CHILL: 'staking_chill'
}

const methodEndpoints: Map<PolkadotTransactionType, string> = new Map([
    [PolkadotTransactionType.TRANSFER, RPC_EXTRINSIC.TRANSFER],
    [PolkadotTransactionType.BOND, RPC_EXTRINSIC.BOND],
    [PolkadotTransactionType.UNBOND, RPC_EXTRINSIC.UNBOND],
    [PolkadotTransactionType.NOMINATE, RPC_EXTRINSIC.NOMINATE],
    [PolkadotTransactionType.STOP_NOMINATING, RPC_EXTRINSIC.CHILL]
])

interface StorageKeys {
    moduleName: string,
    storageName: string,
    firstKey?: Uint8Array | string,
    secondKey?: Uint8Array | string
}

class StorageKeyUtil {
    private static readonly PREFIX_TRIE_HASH_SIZE = 128
    private static readonly ITEM_HASH_SIZE = 256

    private readonly storageHash: Map<string, string> = new Map()

    public getHash({ moduleName, storageName, firstKey, secondKey }: StorageKeys): string {
        const rawKey = moduleName + storageName + (firstKey || '') + (secondKey || '')

        if (!this.storageHash[rawKey]) {
            this.storageHash[rawKey] = this.generatePrefixTrie(moduleName, storageName) + this.generateItemHash(firstKey, secondKey)
        }

        return this.storageHash[rawKey]
    }

    private generatePrefixTrie(moduleName: string, storageName: string): string {
        const moduleHash = xxhashAsHex(moduleName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        const storageHash = xxhashAsHex(storageName, StorageKeyUtil.PREFIX_TRIE_HASH_SIZE)
        
        return moduleHash + storageHash
    }

    private generateItemHash(firstKey: Uint8Array | string | undefined, secondKey: Uint8Array | string | undefined): string {
        const firstKeyHash = firstKey ? blake2bAsHex(firstKey, StorageKeyUtil.ITEM_HASH_SIZE) : ''
        const secondKeyHash = secondKey ? blake2bAsHex(secondKey, StorageKeyUtil.ITEM_HASH_SIZE) : ''

        return firstKeyHash + secondKeyHash
    }
}

export class PolkadotNodeClient {
    private metadata: Metadata | null = null

    constructor(
        private readonly baseURL: string, 
        private readonly storageKeyUtil: StorageKeyUtil = new StorageKeyUtil()
    ) {}

    public getBalance(accountId: Uint8Array | string): Promise<BigNumber> {
        return this.getFromStorage<BigNumber>(
            { moduleName: 'Balances', storageName: 'FreeBalance', firstKey: isString(accountId) ? Buffer.from(accountId, 'hex') : accountId },
            result => result ? SCALEInt.decode(result).decoded.value : new BigNumber(0)
        )
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
            [isString(transactionBytes) ? transactionBytes : Buffer.from(transactionBytes).toString('hex')],
            result => result ? new BigNumber(result.partialFee) : null
        )
    }

    public getNonce(accountId: Uint8Array | string): Promise<BigNumber | null> {
        return this.getFromStorage<BigNumber | null>(
            { moduleName: 'System', storageName: 'AccountNonce', firstKey: isString(accountId) ? Buffer.from(accountId, 'hex') : accountId },
            result => result ? SCALEInt.decode(result).decoded.value : null
        )
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

    public getSpecVersion(): Promise<number> {
        return this.send<number, any>(
            RPC_ENDPOINTS.GET_RUNTIME_VERSION,
            [],
            result => result.specVersion
        )
    }

    public getNominations(accountId: Uint8Array | string): Promise<PolkadotNominations | null> {
        return this.getFromStorage<PolkadotNominations | null>(
            { moduleName: 'Staking', storageName: 'Nominators', firstKey: isString(accountId) ? Buffer.from(accountId, 'hex') : accountId },
            result => result ? PolkadotNominations.decode(result) : null
        )
    }

    public async getValidatorDetails(accountId: Uint8Array | string): Promise<PolkadotValidatorDetails> {
        const _accountId = isString(accountId) ? Buffer.from(accountId, 'hex') : accountId

        const identity = await this.getFromStorage<PolkadotValidatorIdentity | null>(
            { moduleName: 'Sudo', storageName: 'IdentityOf', firstKey: _accountId },
            result => result ? PolkadotValidatorIdentity.decode(result) : null
        )

        const currentValidators = await this.getFromStorage<Buffer[] | null>(
            { moduleName: 'Session', storageName: 'Validators' },
            result => result ? SCALEArray.decode(result, SCALEAccountId.decode).decoded.elements.map(encoded => encoded.value) : null
        )

        const prefs = await this.getFromStorage<PolkadotValidatorPrefs | null>(
            { moduleName: 'Staking', storageName: 'Validators', firstKey: _accountId },
            result => result ? PolkadotValidatorPrefs.decode(result) : null
        )

        let status: PolkadotValidatorStatus | null
        // TODO: check if reaped
        if (!currentValidators) {
            status = null
        } else if (currentValidators.find(buffer => buffer.compare(_accountId) == 0)) {
            status = PolkadotValidatorStatus.ACTIVE
        } else {
            status = PolkadotValidatorStatus.INACTIVE
        }

        const exposure = await this.getValidatorExposure(_accountId)
        
        return {
            name: identity ? identity.display.value : null,
            status,
            ownStash: exposure ? exposure.ownStash.value : null,
            totalStakingBalance: exposure ? exposure.totalBalance.value : null,
            commission: prefs ? prefs.commission.value.dividedBy(1_000_000_000) : null // commission is Perbill (parts per billion)
        }
    }

    public submitTransaction(encoded: string): Promise<string | null> {
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

    private async getBlockHash(blockNumber?: number): Promise<string | null> {
        return this.send<string, string>(
            RPC_ENDPOINTS.GET_BLOCK_HASH,
            blockNumber !== undefined ? [toHexString(blockNumber)] : []
        )
    }

    private async getValidatorExposure(accountId: string | Uint8Array): Promise<PolkadotExposure | null> {
        return this.getFromStorage(
            { moduleName: 'Staking', storageName: 'Stakers', firstKey: isString(accountId) ? Buffer.from(accountId, 'hex') : accountId },
            result => result ? PolkadotExposure.decode(result) : null
        )
    }

    private async getFromStorage<T>(storageKeys: StorageKeys, resultHandler?: (result: string | null) => T): Promise<T> {
        return this.send<T, string>(
            RPC_ENDPOINTS.GET_STORAGE,
            [this.storageKeyUtil.getHash(storageKeys)],
            resultHandler
        )
    }

    private async send<T, R>(method: string, params: string[], resultHandler?: (result: R | null) => T): Promise<T> {
        const response: AxiosResponse = await axios.post(this.baseURL, new RPCBody(method, params.map(param => addHexPrefix(param))))
        
        return resultHandler ? resultHandler(response.data.result) : response.data.result
    }
}