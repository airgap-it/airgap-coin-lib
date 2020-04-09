import axios from '../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { 
    SubstrateRpcModuleName, 
    SubstrateRpcMethodName, 
    SubstrateStorageModuleName, 
    SubstrateStorageEntryName, 
    SubstrateCallModuleName, 
    SubstrateCallName, 
    SubstrateConstantModuleName, 
    SubstrateConstantName, 
    supportedCallEndpoints,
    supportedStorageEntries,
    supportedCalls,
    supportedConstants
} from './supported'

import { SubstrateStorageEntry } from './storage/SubstrateStorageEntry'
import { SubstrateCallId } from './call/SubstrateCallId'
import { SubstrateConstant } from './constant/SubstrateConstant'
import { RPCBody } from '../../../data/RPCBody'
import { addHexPrefix, bytesToHex, stripHexPrefix, toHexString } from '../../../utils/hex'
import { Metadata } from '../data/metadata/Metadata'
import { SubstrateAddress } from '../data/account/SubstrateAddress'
import { SubstrateAccountInfo } from '../data/account/SubstrateAccountInfo'
import { SCALEType } from '../data/scale/type/SCALEType'
import { SCALEAccountId } from '../data/scale/type/SCALEAccountId'
import { MetadataStorage } from '../data/metadata/module/storage/MetadataStorage'
import { MetadataCall } from '../data/metadata/module/MetadataCall'
import { MetadataConstant } from '../data/metadata/module/MetadataConstants'
import { SubstrateNodeCache } from './SubstrateNodeCache'
import { SCALEInt } from '../data/scale/type/SCALEInt'
import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateNominations } from '../data/staking/SubstrateNominations'
import { SubstrateStakingLedger } from '../data/staking/SubstrateStakingLedger'
import { SubstrateEraRewardPoints } from '../data/staking/SubstrateEraRewardPoints'
import { SubstratePayee } from '../data/staking/SubstratePayee'
import { SCALEEnum } from '../data/scale/type/SCALEEnum'
import { SCALEArray } from '../data/scale/type/SCALEArray'
import { SubstrateRegistration } from '../data/account/SubstrateRegistration'
import { SubstrateActiveEraInfo } from '../data/staking/SubstrateActiveEraInfo'
import { SubstrateExposure } from '../data/staking/SubstrateExposure'
import { SubstrateValidatorPrefs } from '../data/staking/SubstrateValidatorPrefs'

interface ConnectionConfig {
    allowCache: boolean
}

const CACHE_DEFAULT_EXPIRATION_TIME = 3000 // 3s

export class SubstrateNodeClient {
    private readonly storageEntries: Map<string, SubstrateStorageEntry> = new Map()
    private readonly calls: Map<string, SubstrateCallId> = new Map()
    private readonly constants: Map<string, SubstrateConstant> = new Map()

    private readonly lastFees: Map<SubstrateTransactionType, BigNumber> = new Map()

    private initApiPromise: Promise<void> | null = null

    public constructor(
        private readonly baseURL: string,
        private readonly cache: SubstrateNodeCache = new SubstrateNodeCache(CACHE_DEFAULT_EXPIRATION_TIME)
    ) {}

    public async getAccountInfo(address: SubstrateAddress): Promise<SubstrateAccountInfo | null> {
        return this.fromStorage('System', 'Account', SCALEAccountId.from(address))
            .then(item => item ? SubstrateAccountInfo.decode(item) : null)
    }

    public async getExistentialDeposit(): Promise<BigNumber> {
        return this.getConstant('Balances', 'ExistentialDeposit')
            .then(constant => SCALEInt.decode(constant).decoded.value)
    }

    public async getTransactionMetadata(type: SubstrateTransactionType): Promise<SubstrateCallId> {
        const [methodName, callName] = supportedCallEndpoints.get(type) || [null, null]
        
        let callId: SubstrateCallId | null = null
        if (methodName && callName) {
            callId = await this.getCallId(methodName, callName)   
        }
        return callId ? callId : Promise.reject('Could not find requested item.')
    }

    public async getTransferFeeEstimate(transactionBytes: Uint8Array | string): Promise<BigNumber | null> {
        return this.send('payment', 'queryInfo', [bytesToHex(transactionBytes)])    
            .then(result => result ? new BigNumber(result.partialFee) : null)
    }

    public saveLastFee(type: SubstrateTransactionType, fee: BigNumber) {
        this.lastFees.set(type, fee)
    }

    public getSavedLastFee(type: SubstrateTransactionType, defaultValue: 'null' | 'largest' = 'null'): BigNumber | null {
        let fee = this.lastFees.get(type) || null

        if (!fee && defaultValue === 'largest') {
            const savedFees = Array.from(this.lastFees.values())
            fee = savedFees.length > 0 ? BigNumber.max(...savedFees) : null
        }

        return fee
    }

    public async getBaseTransactionFee(): Promise<BigNumber | null> {
        return this.getConstant('TransactionPayment', 'TransactionBaseFee')
            .then(constant => SCALEInt.decode(constant).decoded.value)
    }

    public async getFirstBlockHash(): Promise<string | null> {
        return this.getBlockHash(0)
    }

    public async getLastBlockHash(): Promise<string | null> {
        return this.getBlockHash()
    }

    public async getCurrentHeight(): Promise<BigNumber> {
        return this.send('chain', 'getBlock')
            .then(result => new BigNumber(stripHexPrefix(result.block.header.number), 16))
    }

    public async getCurrentEraIndex(): Promise<BigNumber | null> {
        return this.fromStorage('Staking', 'CurrentEra')
            .then(item => item ? SCALEInt.decode(item).decoded.value : null)
    }

    public async getSpecVersion(): Promise<number> {
        return this.send('state', 'getRuntimeVersion')
            .then(result => result.specVersion)
    }

    public async getBonded(address: SubstrateAddress): Promise<SubstrateAddress | null> {
        return this.fromStorage('Staking', 'Bonded', SCALEAccountId.from(address))
            .then(item => item ? SCALEAccountId.decode(item).decoded.address : null)
    }

    public async getNominations(address: SubstrateAddress): Promise<SubstrateNominations | null> {
        return this.fromStorage('Staking', 'Nominators', SCALEAccountId.from(address))
            .then(item => item ? SubstrateNominations.decode(item) : null)   
    }

    public async getRewardPoints(eraIndex: number): Promise<SubstrateEraRewardPoints | null> {
        return this.fromStorage('Staking', 'ErasRewardPoints', SCALEInt.from(eraIndex, 32))
            .then(item => item ? SubstrateEraRewardPoints.decode(item) : null)
    }

    public async getValidatorReward(eraIndex: number): Promise<BigNumber | null> {
        return this.fromStorage('Staking', 'ErasValidatorReward', SCALEInt.from(eraIndex, 32))
            .then(item => item ? SCALEInt.decode(item).decoded.value : null)
    }

    public async getStakersClipped(eraIndex: number, validator: SubstrateAddress): Promise<SubstrateExposure | null> {
        return this.fromStorage('Staking', 'ErasStakersClipped', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(validator))
            .then(item => item ? SubstrateExposure.decode(item) : null)
    }

    public async getRewardDestination(address: SubstrateAddress): Promise<SubstratePayee | null> {
        return this.fromStorage('Staking', 'Payee', SCALEAccountId.from(address))
            .then(item => item 
                ? SCALEEnum.decode(item, hex => SubstratePayee[SubstratePayee[hex]]).decoded.value
                : null
            )
    }

    public async getStakingLedger(address: SubstrateAddress): Promise<SubstrateStakingLedger | null> {
        return this.fromStorage('Staking', 'Ledger', SCALEAccountId.from(address))
            .then(item => item ? SubstrateStakingLedger.decode(item) : null)
    }

    public async getValidators(): Promise<SubstrateAddress[] | null> {
        return this.fromStorage('Session', 'Validators')
            .then(items => items 
                ? SCALEArray.decode(items, SCALEAccountId.decode).decoded.elements.map(encoded => encoded.address)
                : null
            )
    }

    public async getValidatorExposure(address: SubstrateAddress): Promise<SubstrateExposure | null> {
        const eraIndex = await this.getCurrentEraIndex() || 0

        return this.fromStorage('Staking', 'ErasStakers', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address))
            .then(item => item ? SubstrateExposure.decode(item) : null)
    }

    public async getIdentityOf(address: SubstrateAddress): Promise<SubstrateRegistration | null> {
        return this.fromStorage('Identity', 'IdentityOf', SCALEAccountId.from(address))
            .then(item => item ? SubstrateRegistration.decode(item) : null)
    }

    public async getValidatorPrefs(eraIndex: number, address: SubstrateAddress): Promise<SubstrateValidatorPrefs | null> {
        return this.fromStorage('Staking', 'ErasValidatorPrefs', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address))
            .then(item => item ? SubstrateValidatorPrefs.decode(item) : null)
    }

    public async getExpectedEraDuration(): Promise<BigNumber | null> {
        const constants = await Promise.all([
            this.getConstant('Babe', 'ExpectedBlockTime'),
            this.getConstant('Babe', 'EpochDuration'),
            this.getConstant('Staking', 'SessionsPerEra')
        ]).then(constants => constants.map(constant => constant ? SCALEInt.decode(constant).decoded.value : null))

        if (constants.some(constant => constant === null)) {
            return null
        }

        const expectedBlockTime = constants[0]!
        const epochDuration = constants[1]!
        const sessionsPerEra = constants[2]!
        
        return expectedBlockTime.multipliedBy(epochDuration).multipliedBy(sessionsPerEra)
    }

    public async getActiveEraInfo(): Promise<SubstrateActiveEraInfo | null> {
        return this.fromStorage('Staking', 'ActiveEra')
            .then(item => item ? SubstrateActiveEraInfo.decode(item) : null)
    }

    public async submitTransaction(encoded: string): Promise<string> {
        return this.send('author', 'submitExtrinsic', [encoded])
    }

    private async getBlockHash(blockNumber?: number): Promise<string | null> {
        return this.send('chain', 'getBlockHash', blockNumber !== undefined ? [toHexString(blockNumber)] : [])
    }

    private async fromStorage<M extends SubstrateStorageModuleName, E extends SubstrateStorageEntryName<M>>(
        moduleName: M,
        entryName: E,
        ...args: SCALEType[]
    ): Promise<string | null> {
        await this.initApi()
        const key = this.createMapKey(moduleName, entryName)
        const storageEntry = this.storageEntries.get(key)

        if (!storageEntry) {
            return Promise.reject(`Could not find requested item: ${moduleName} ${entryName}`)
        }

        const hash = await storageEntry.hash(moduleName, entryName, ...args)
        const result = await this.send('state', 'getStorage', [hash])

        return result
    }

    private async getCallId<M extends SubstrateCallModuleName, C extends SubstrateCallName<M>>(
        moduleName: M,
        callName: C
    ): Promise<SubstrateCallId> {
        await this.initApi()
        const key = this.createMapKey(moduleName, callName)
        const callId = this.calls.get(key)

        return callId 
            ? callId 
            : Promise.reject(`Could not find requested item: ${moduleName} ${callName}`)
    }

    private async getConstant<M extends SubstrateConstantModuleName, C extends SubstrateConstantName<M>>(
        moduleName: M,
        constantName: C,
    ): Promise<string> {
        await this.initApi()
        const key = this.createMapKey(moduleName, constantName)
        const constant = this.constants.get(key)

        return constant 
            ? constant.value.toString('hex') 
            : Promise.reject(`Could not find requested item: ${moduleName} ${constantName}`)
    }

    private async initApi(): Promise<void> {
        if (!this.initApiPromise) {
            this.initApiPromise = new Promise(async (resolve) => {
                const metadataEncoded = await this.send('state', 'getMetadata')
                const metadata = Metadata.decode(metadataEncoded)
        
                let callModuleIndex = 0
                for (let module of metadata.modules.elements) {
                    const moduleName = module.name.value
        
                    const storagePrefix = module.storage.value?.prefix?.value
                    if (storagePrefix && Object.keys(supportedStorageEntries).includes(storagePrefix)) {
                        this.initStorageEntries(module.storage.value)
                    }
        
                    if (Object.keys(supportedCalls).includes(moduleName)) {
                        this.initCalls(moduleName, callModuleIndex, module.calls.value?.elements || [])
                    }
        
                    if (Object.keys(supportedConstants).includes(moduleName)) {
                        this.initConstants(moduleName, module.constants.elements)
                    }
        
                    if (module.calls.value !== null) {
                        callModuleIndex += 1
                    }
                } 
                
                resolve()
            }).then(async () => {
                this.initApiPromise = Promise.resolve()
                await this.initCache()
            })
        }

        return this.initApiPromise
    }

    private initStorageEntries(storage: MetadataStorage | null) {
        if (storage) {
            const storageEntries = storage.storageEntries.elements
                .filter(entry => supportedStorageEntries[storage.prefix.value].includes(entry.name.value))
                .map(entry => [entry.name.value, SubstrateStorageEntry.fromMetadata(entry.type)] as [string, SubstrateStorageEntry])

            storageEntries.forEach(([name, entry]) => {
                this.storageEntries.set(this.createMapKey(storage.prefix.value, name), entry)
            })
        }
    }

    private initCalls(moduleName: string, moduleIndex: number, calls: MetadataCall[]) {
        calls.forEach((call, index) => {
            this.calls.set(this.createMapKey(moduleName, call.name.value), new SubstrateCallId(moduleIndex, index))
        })
    }

    private initConstants(moduleName: string, constants: MetadataConstant[]) {
        constants.forEach(constant => {
            this.constants.set(this.createMapKey(moduleName, constant.name.value), SubstrateConstant.fromMetadata(constant))
        })
    }

    private async initCache(): Promise<void> {
        const blockTime = await this.getConstant('Babe', 'ExpectedBlockTime')
            .then(constant => SCALEInt.decode(constant).decoded.toNumber())

        this.cache.expirationTime = Math.floor(blockTime / 3)
    }

    private createMapKey(module: string, item: string): string {
        return `${module}_${item}`
    }

    private async send<T extends SubstrateRpcModuleName, S extends SubstrateRpcMethodName<T>>(
        module: T,
        method: S, 
        params: string[] = [],
        config: ConnectionConfig = { allowCache: true }
    ): Promise<any> {
        const endpoint = `${module}_${method}`
        const key = `${endpoint}$${params.join('')}`

        return this.cache.get(key)
            .catch(() => {
                const promise = axios
                    .post(this.baseURL, new RPCBody(endpoint, params.map(param => addHexPrefix(param))))
                    .then(response => response.data.result)   

                return this.cache.save(key, promise, { cacheValue: config.allowCache })
            })
    }
}

