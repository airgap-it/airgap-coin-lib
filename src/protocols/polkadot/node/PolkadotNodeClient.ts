import axios from '../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { RPCBody } from '../../../data/RPCBody'
import { stripHexPrefix, toHexString, addHexPrefix, bytesToHex } from '../../../utils/hex'
import { PolkadotTransactionType } from '../transaction/data/PolkadotTransaction'
import { PolkadotNominations } from '../staking/PolkadotNominations'
import { 
    PolkadotValidatorDetails, 
    PolkadotValidatorPrefs, 
    PolkadotValidatorStatus, 
    PolkadotExposure 
} from '../staking/PolkadotValidatorDetails'
import { Metadata, ExtrinsicId } from './metadata/Metadata'
import { SCALEInt } from './codec/type/SCALEInt'
import { SCALEArray } from './codec/type/SCALEArray'
import { SCALEAccountId } from './codec/type/SCALEAccountId'
import { PolkadotAccountInfo } from '../account/data/PolkadotAccountInfo'
import { PolkadotAddress } from '../account/PolkadotAddress'
import { PolkadotRewardDestination } from '../../..'
import { SCALEEnum } from './codec/type/SCALEEnum'
import { PolkadotRegistration } from '../account/data/PolkadotRegistration'
import { PolkadotStakingLedger } from '../staking/PolkadotStakingLedger'
import { PolkadotStorageUtils, PolkadotStorageKeys } from './PolkadotStorageUtils'
import { PolkadotActiveEraInfo } from '../staking/PolkadotActiveEraInfo'
import { PolkadotNodeCache } from './PolkadotNodeCache'

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

const RPC_CONSTANTS = {
    EXISTENTIAL_DEPOSIT: 'Balances_ExistentialDeposit',
    EXPECTED_BLOCK_TIME: 'Babe_ExpectedBlockTime',
    EPOCH_DURATION: 'Babe_EpochDuration',
    SESSIONS_PER_ERA: 'Staking_SessionsPerEra'
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

const CACHE_EXPIRATION_TIME = 3000 // 3s

interface ConnectionConfig {
    allowCache: boolean
}

export class PolkadotNodeClient {
    private metadata: Metadata | null = null

    constructor(
        private readonly baseURL: string, 
        private readonly storageUtils: PolkadotStorageUtils = new PolkadotStorageUtils(),
        private readonly cache: PolkadotNodeCache = new PolkadotNodeCache(CACHE_EXPIRATION_TIME)
    ) {
       this.getConstant(RPC_CONSTANTS.EXPECTED_BLOCK_TIME, constant => constant ? SCALEInt.decode(constant).decoded.toNumber() : null)
        .then(blockTime => {
            if (blockTime) {
                this.cache.expirationTime = Math.floor(blockTime / 3)
            }
        }) 
    }

    public async getBalance(address: PolkadotAddress): Promise<BigNumber> {
        const accountInfo = await this.getAccountInfo(address)

        return accountInfo?.data.free.value || new BigNumber(0)
    }

    public async getExistentialDeposit(): Promise<BigNumber | null> {
        return this.getConstant(
            RPC_CONSTANTS.EXISTENTIAL_DEPOSIT,
            constant => constant ? SCALEInt.decode(constant).decoded.value : null
        )
    }

    public async getTransactionMetadata(type: PolkadotTransactionType): Promise<ExtrinsicId | null> {
        const rpcEndpoint = methodEndpoints.get(type) || ''
        try {
            return await this.getFromMetadata(() => this.metadata!.getExtrinsicId(rpcEndpoint))
        } catch (error) {
            console.error(error)
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
                    value: address.getBufferPublicKey()
                } 
            },
            result => result ? PolkadotNominations.decode(result) : null
        )
    }

    public getRewardDestination(address: PolkadotAddress): Promise<PolkadotRewardDestination | null> {
        return this.getFromStorage<PolkadotRewardDestination | null>(
            {
                moduleName: 'Staking',
                storageName: 'Payee',
                firstKey: {
                    value: address.getBufferPublicKey()
                }
            },
            result => result ? SCALEEnum.decode(result, hex => PolkadotRewardDestination[PolkadotRewardDestination[hex]]).decoded.value : null
        )
    }

    public getLedger(address: PolkadotAddress): Promise<PolkadotStakingLedger | null> {
        return this.getFromStorage<PolkadotStakingLedger | null>(
            {
                moduleName: 'Staking',
                storageName: 'Ledger',
                firstKey: {
                    value: address.getBufferPublicKey()
                }
            },
            result => result ? PolkadotStakingLedger.decode(result) : null
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
            this.getFromStorage<PolkadotRegistration | null>(
                { 
                    moduleName: 'Identity', 
                    storageName: 'IdentityOf', 
                    firstKey: { 
                        value: address.getBufferPublicKey()
                    } 
                },
                result => result ? PolkadotRegistration.decode(result) : null
            ),
            this.getValidators(),
            this.getFromStorage<PolkadotValidatorPrefs | null>(
                { 
                    moduleName: 'Staking', 
                    storageName: 'Validators', 
                    firstKey: { 
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
            name: identity ? identity.identityInfo.display : null,
            status,
            ownStash: exposure ? exposure.ownStash.value : null,
            totalStakingBalance: exposure ? exposure.totalBalance.value : null,
            commission: prefs ? prefs.commission.value.dividedBy(1_000_000_000) : null // commission is Perbill (parts per billion)
        }
    }

    public async getExpectedEraDuration(): Promise<BigNumber | null> {
        const constants = await this.getConstants([
            RPC_CONSTANTS.EXPECTED_BLOCK_TIME,
            RPC_CONSTANTS.EPOCH_DURATION,
            RPC_CONSTANTS.SESSIONS_PER_ERA
        ], constant => constant ? SCALEInt.decode(constant).decoded.value : null)

        if (constants.some(constant => constant === null)) {
            return null
        }

        const expectedBlockTime = constants[0]!
        const epochDuration = constants[1]!
        const sessionsPerEra = constants[2]!
        
        return expectedBlockTime.multipliedBy(epochDuration).multipliedBy(sessionsPerEra)
    }

    public async getActiveEraInfo(): Promise<PolkadotActiveEraInfo | null> {
        return this.getFromStorage(
            {
                moduleName: 'Staking',
                storageName: 'ActiveEra'
            },
            result => result ? PolkadotActiveEraInfo.decode(result) : null
        )
    }

    public submitTransaction(encoded: string): Promise<string> {
        return this.send<string, string>(
            RPC_ENDPOINTS.SUBMIT_EXTRINSIC,
            [encoded]
        )
    }

    private async getConstant<T>(key: string, decoder: (value: string) => T): Promise<T> {
        const constant = await this.getFromMetadata(() => this.metadata!.getConstant(key))
        return decoder(constant)
    }

    private async getConstants<T>(keys: string[], decoder: (value: string) => T): Promise<T[]> {
        return Promise.all(keys.map(key => this.getConstant(key, decoder)))
    }

    private async getFromMetadata<T>(metadataGetter: () => T | undefined): Promise<T> {
        if (!this.metadata) {
            await this.fetchMetadata()
        }

        if (!this.metadata) {
            return Promise.reject('Could not fetch metadata')
        }

        const value = metadataGetter()
        if (value === undefined) {
            return Promise.reject('Item not found in metadata.')
        }

        return value
    }

    private async fetchMetadata(): Promise<void> {
        this.metadata = await this.send<(Metadata | null), string>(
            RPC_ENDPOINTS.GET_METADATA,
            [],
            result => result ? Metadata.decode(result) : null,
            { allowCache: false }
        )
    }

    private async getAccountInfo(address: PolkadotAddress): Promise<PolkadotAccountInfo | null> {
        return this.getFromStorage<PolkadotAccountInfo | null>(
            { 
                moduleName: 'System', 
                storageName: 'Account', 
                firstKey: { 
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
                    value: SCALEInt.from(eraIndex, 32).encode() 
                }, 
                secondKey: { 
                    value: address.getBufferPublicKey()
                } 
            },
            result => result ? PolkadotExposure.decode(result) : null
        )
    }

    private async getFromStorage<T>(
        storageKeys: PolkadotStorageKeys, 
        resultHandler: (result: string | null) => T,
        config: ConnectionConfig = { allowCache: true }
    ): Promise<T | null> {
        try {
            const keyIndex = `${storageKeys.moduleName}_${storageKeys.storageName}`
            const hashers = await this.getFromMetadata(() => this.metadata!.getHasher(keyIndex))

            if (storageKeys.firstKey) {
                storageKeys.firstKey.hasher = hashers[0]
            }

            if (storageKeys.secondKey) {
                storageKeys.secondKey.hasher = hashers[1]
            }

            return this.send<T, string>(
                RPC_ENDPOINTS.GET_STORAGE,
                [await this.storageUtils.getHash(storageKeys)],
                resultHandler,
                config
            )
        } catch (error) {
            console.error(error)
            return null
        }
    }

    private async send<T, R>(
        method: string, 
        params: string[], 
        resultHandler?: (result: R | null) => T,
        config: ConnectionConfig = { allowCache: true }
    ): Promise<T> {
        const key = `${method}$${params.join('')}`

        return this.cache.get<T>(key)
            .catch(() => {
                const promise = axios.post(this.baseURL, new RPCBody(method, params.map(param => addHexPrefix(param))))
                    .then(response => resultHandler ? resultHandler(response.data.result) : response.data.result)   

                return this.cache.save(key, promise, { cacheValue: config.allowCache })
            })
    }
}