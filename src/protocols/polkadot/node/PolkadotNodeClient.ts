import axios from '../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { 
    PolkadotRpcModuleName, 
    PolkadotRpcMethodName, 
    PolkadotStorageModuleName, 
    PolkadotStorageEntryName, 
    PolkadotCallModuleName, 
    PolkadotCallName, 
    PolkadotConstantModuleName, 
    PolkadotConstantName, 
    supportedCallEndpoints,
    supportedStorageEntries,
    supportedCalls,
    supportedConstants
} from './supported'

import { PolkadotStorageEntry } from './storage/PolkadotStorageEntry'
import { PolkadotCallId } from './call/PolkadotCallId'
import { PolkadotConstant } from './constant/PolkadotConstant'
import { RPCBody } from '../../../data/RPCBody'
import { addHexPrefix, bytesToHex, stripHexPrefix, toHexString } from '../../../utils/hex'
import { Metadata } from '../data/metadata/Metadata'
import { PolkadotAddress } from '../data/account/PolkadotAddress'
import { PolkadotAccountInfo } from '../data/account/PolkadotAccountInfo'
import { SCALEType } from '../data/scale/type/SCALEType'
import { SCALEAccountId } from '../data/scale/type/SCALEAccountId'
import { MetadataStorage } from '../data/metadata/module/storage/MetadataStorage'
import { MetadataCall } from '../data/metadata/module/MetadataCall'
import { MetadataConstant } from '../data/metadata/module/MetadataConstants'
import { PolkadotNodeCache } from './PolkadotNodeCache'
import { SCALEInt } from '../data/scale/type/SCALEInt'
import { PolkadotTransactionType } from '../data/transaction/PolkadotTransaction'
import { PolkadotNominations } from '../data/staking/PolkadotNominations'
import { PolkadotReward, PolkadotStakingLedger } from '../data/staking/PolkadotStakingLedger'
import { PolkadotExposure, PolkadotValidatorDetails, PolkadotValidatorStatus, PolkadotValidatorPrefs } from '../data/staking/PolkadotValidatorDetails'
import { PolkadotEraRewardPoints } from '../data/staking/PolkadotEraRewardPoints'
import { PolkadotRewardDestination } from '../data/staking/PolkadotRewardDestination'
import { SCALEEnum } from '../data/scale/type/SCALEEnum'
import { SCALEArray } from '../data/scale/type/SCALEArray'
import { PolkadotRegistration } from '../data/account/PolkadotRegistration'
import { PolkadotActiveEraInfo } from '../data/staking/PolkadotActiveEraInfo'

interface ConnectionConfig {
    allowCache: boolean
}

const CACHE_EXPIRATION_TIME = 3000 // 3s

export class PolkadotNodeClient {
    private readonly storageEntries: Map<string, PolkadotStorageEntry> = new Map()
    private readonly calls: Map<string, PolkadotCallId> = new Map()
    private readonly constants: Map<string, PolkadotConstant> = new Map()

    public constructor(
        private readonly baseURL: string,
        private readonly cache: PolkadotNodeCache = new PolkadotNodeCache(CACHE_EXPIRATION_TIME)
    ) {
        this.getConstant('Babe', 'ExpectedBlockTime')
            .then(constant => {
                const blockTime = SCALEInt.decode(constant).decoded.toNumber()
                if (blockTime) {
                    this.cache.expirationTime = Math.floor(blockTime / 3)
                }
            }) 
    }

    public async getBalance(address: PolkadotAddress): Promise<BigNumber> {
        const accountInfo = await this.getAccountInfo(address)

        return accountInfo?.data.free.value || new BigNumber(0)
    }

    public async getExistentialDeposit(): Promise<BigNumber> {
        return this.getConstant('Balances', 'ExistentialDeposit')
            .then(constant => SCALEInt.decode(constant).decoded.value)
    }

    public async getTransactionMetadata(type: PolkadotTransactionType): Promise<PolkadotCallId> {
        const [methodName, callName] = supportedCallEndpoints.get(type) || [null, null]
        
        let callId: PolkadotCallId | null = null
        if (methodName && callName) {
            callId = await this.getCallId(methodName, callName)   
        }
        return callId ? callId : Promise.reject('Could not find requested item.')
    }

    public getTransferFeeEstimate(transactionBytes: Uint8Array | string): Promise<BigNumber | null> {
        return this.send('payment', 'queryInfo', [bytesToHex(transactionBytes)])    
            .then(result => new BigNumber(result.partialFee))
    }

    public getBaseTransactionFee(): Promise<BigNumber | null> {
        return this.getConstant('TransactionPayment', 'TransactionBaseFee')
            .then(constant => SCALEInt.decode(constant).decoded.value)
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
        return this.send('chain', 'getBlock')
            .then(result => new BigNumber(stripHexPrefix(result.block.header.number), 16))
    }

    public getCurrentEraIndex(): Promise<BigNumber | null> {
        return this.fromStorage('Staking', 'CurrentEra')
            .then(item => item ? SCALEInt.decode(item).decoded.value : null)
    }

    public getSpecVersion(): Promise<number> {
        return this.send('state', 'getRuntimeVersion')
            .then(result => result.specVersion)
    }

    public getBonded(address: PolkadotAddress): Promise<PolkadotAddress | null> {
        return this.fromStorage('Staking', 'Bonded', SCALEAccountId.from(address))
            .then(item => item ? SCALEAccountId.decode(item).decoded.address : null)
    }

    public getNominations(address: PolkadotAddress): Promise<PolkadotNominations | null> {
        return this.fromStorage('Staking', 'Nominators', SCALEAccountId.from(address))
            .then(item => item ? PolkadotNominations.decode(item) : null)   
    }

    public async getRewards(
        address: PolkadotAddress, 
        validators: PolkadotAddress[], 
        currentEra: number, 
        limit: number = 1
    ): Promise<PolkadotReward[]> {
        const rewards: PolkadotReward[] = []

        const eras = Array.from(Array(limit).keys()).map(index => currentEra - 1 - index)
        for (let era of eras) {
            const results = await Promise.all([
                this.getValidatorReward(era),
                this.getRewardPoints(era),
                Promise.all(validators.map(async validator => 
                    [
                        validator, 
                        (await this.getValidatorPrefs(validator))?.commission?.value,
                        await this.getStakersClipped(era, validator)
                    ] as [PolkadotAddress, BigNumber | null, PolkadotExposure | null]
                )),
                this.getLedger(address)
            ])

            const reward = results[0]
            const rewardPoints = results[1]
            const exposuresWithValidators = results[2]
            const stakingLedger = results[3]

            if (reward && rewardPoints && exposuresWithValidators && stakingLedger) {
                const total = exposuresWithValidators
                    .map(exposureWithValidator => {
                        if (exposureWithValidator[1] && exposureWithValidator[2]) {
                            const validatorPoints = rewardPoints.individual.elements
                                .find(element => element.first.address.compare(exposureWithValidator[0]) === 0)
                            const validatorReward = validatorPoints?.second.value
                                ?.dividedBy(rewardPoints.total.value)
                                ?.multipliedBy(reward) 
                                || new BigNumber(0)

                            const nominatorStake = exposureWithValidator[2].others.elements
                                .find(element => element.first.address.compare(address) === 0)
                                ?.second?.value || new BigNumber(0)

                            const nominatorShare = nominatorStake.dividedBy(exposureWithValidator[2].totalBalance.value)

                            return new BigNumber(1)
                                .minus(exposureWithValidator[1].dividedBy(1_000_000_000))
                                .multipliedBy(validatorReward)
                                .multipliedBy(nominatorShare)
                        } else {
                            return new BigNumber(0)
                        }
                    }).reduce((sum, next) => sum.plus(next), new BigNumber(0))

                rewards.push({
                    eraIndex: era,
                    amount: total,
                    exposures: exposuresWithValidators?.map(exposure => [
                        exposure[0].toString(), 
                        exposure[2]?.others.elements.findIndex(element => element.first.address.compare(address) === 0)
                    ]).filter(([_, index]) => index !== undefined) as [string, number][],
                    timestamp: 0,
                    collected: stakingLedger.lastReward.value?.value?.gte(era) || false
                })
            }
        }
        return rewards.sort((a, b) => b.eraIndex - a.eraIndex)
    }

    public async getRewardPoints(eraIndex: number): Promise<PolkadotEraRewardPoints | null> {
        return this.fromStorage('Staking', 'ErasRewardPoints', SCALEInt.from(eraIndex, 32))
            .then(item => item ? PolkadotEraRewardPoints.decode(item) : null)
    }

    public async getValidatorReward(eraIndex: number): Promise<BigNumber | null> {
        return this.fromStorage('Staking', 'ErasValidatorReward', SCALEInt.from(eraIndex, 32))
            .then(item => item ? SCALEInt.decode(item).decoded.value : null)
    }

    public async getStakersClipped(eraIndex: number, validator: PolkadotAddress): Promise<PolkadotExposure | null> {
        return this.fromStorage('Staking', 'ErasStakersClipped', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(validator))
            .then(item => item ? PolkadotExposure.decode(item) : null)
    }

    public getRewardDestination(address: PolkadotAddress): Promise<PolkadotRewardDestination | null> {
        return this.fromStorage('Staking', 'Payee', SCALEAccountId.from(address))
            .then(item => item 
                ? SCALEEnum.decode(item, hex => PolkadotRewardDestination[PolkadotRewardDestination[hex]]).decoded.value
                : null
            )
    }

    public getLedger(address: PolkadotAddress): Promise<PolkadotStakingLedger | null> {
        return this.fromStorage('Staking', 'Ledger', SCALEAccountId.from(address))
            .then(item => item ? PolkadotStakingLedger.decode(item) : null)
    }

    public getValidators(): Promise<PolkadotAddress[] | null> {
        return this.fromStorage('Session', 'Validators')
            .then(items => items 
                ? SCALEArray.decode(items, SCALEAccountId.decode).decoded.elements.map(encoded => encoded.address)
                : null
            )
    }

    public async getValidatorDetails(address: PolkadotAddress): Promise<PolkadotValidatorDetails> {
        const results = await Promise.all([
            this.fromStorage('Identity', 'IdentityOf', SCALEAccountId.from(address))
                .then(item => item ? PolkadotRegistration.decode(item) : null),
            this.getValidators(),
            this.getValidatorPrefs(address)
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

    public async getValidatorPrefs(address: PolkadotAddress): Promise<PolkadotValidatorPrefs | null> {
        return this.fromStorage('Staking', 'Validators', SCALEAccountId.from(address))
            .then(item => item ? PolkadotValidatorPrefs.decode(item) : null)
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

    public async getActiveEraInfo(): Promise<PolkadotActiveEraInfo | null> {
        return this.fromStorage('Staking', 'ActiveEra')
            .then(item => item ? PolkadotActiveEraInfo.decode(item) : null)
    }

    public submitTransaction(encoded: string): Promise<string> {
        return this.send('author', 'submitExtrinsic', [encoded])
    }

    private async getAccountInfo(address: PolkadotAddress): Promise<PolkadotAccountInfo | null> {
        return this.fromStorage('System', 'Account', SCALEAccountId.from(address))
            .then(item => item ? PolkadotAccountInfo.decode(item) : null)
    }

    private async getBlockHash(blockNumber?: number): Promise<string | null> {
        return this.send('chain', 'getBlockHash', blockNumber !== undefined ? [toHexString(blockNumber)] : [])
    }

    private async getValidatorExposure(address: PolkadotAddress): Promise<PolkadotExposure | null> {
        const eraIndex = await this.getCurrentEraIndex() || 0

        return this.fromStorage('Staking', 'ErasStakers', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address))
            .then(item => item ? PolkadotExposure.decode(item) : null)
    }

    private async fromStorage<M extends PolkadotStorageModuleName, E extends PolkadotStorageEntryName<M>>(
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

    private async getCallId<M extends PolkadotCallModuleName, C extends PolkadotCallName<M>>(
        moduleName: M,
        callName: C
    ): Promise<PolkadotCallId> {
        await this.initApi()
        const key = this.createMapKey(moduleName, callName)
        const callId = this.calls.get(key)

        return callId ? callId : Promise.reject(`Could not find requested item: ${moduleName} ${callName}`)
    }

    private async getConstant<M extends PolkadotConstantModuleName, C extends PolkadotConstantName<M>>(
        moduleName: M,
        constantName: C,
    ): Promise<string> {
        await this.initApi()
        const key = this.createMapKey(moduleName, constantName)
        const constant = this.constants.get(key)

        return constant ? constant.value.toString('hex') : Promise.reject(`Could not find requested item: ${moduleName} ${constantName}`)
    }

    private async initApi(): Promise<void> {
        const alreadyInitialized = 
            this.storageEntries.keys.length > 0 &&
            this.calls.keys.length > 0 &&
            this.constants.keys.length > 0

        if (alreadyInitialized) {
            return
        }

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
    }

    private initStorageEntries(storage: MetadataStorage | null) {
        if (storage) {
            const storageEntries = storage.storageEntries.elements
                .filter(entry => supportedStorageEntries[storage.prefix.value].includes(entry.name.value))
                .map(entry => [entry.name.value, PolkadotStorageEntry.fromMetadata(entry.type)] as [string, PolkadotStorageEntry])

            storageEntries.forEach(([name, entry]) => {
                this.storageEntries.set(this.createMapKey(storage.prefix.value, name), entry)
            })
        }
    }

    private initCalls(moduleName: string, moduleIndex: number, calls: MetadataCall[]) {
        calls.forEach((call, index) => {
            this.calls.set(this.createMapKey(moduleName, call.name.value), new PolkadotCallId(moduleIndex, index))
        })
    }

    private initConstants(moduleName: string, constants: MetadataConstant[]) {
        constants.forEach(constant => {
            this.constants.set(this.createMapKey(moduleName, constant.name.value), PolkadotConstant.fromMetadata(constant))
        })
    }

    private createMapKey(module: string, item: string): string {
        return `${module}_${item}`
    }

    private async send<T extends PolkadotRpcModuleName, S extends PolkadotRpcMethodName<T>>(
        module: T,
        method: S, 
        params: string[] = [],
        config: ConnectionConfig = { allowCache: true }
    ): Promise<any> {
        const endpoint = `${module}_${method}`
        const key = `${endpoint}$${params.join('')}`

        return this.cache.get<T>(key)
            .catch(() => {
                const promise = axios
                    .post(this.baseURL, new RPCBody(endpoint, params.map(param => addHexPrefix(param))))
                    .then(response => response.data.result)   

                return this.cache.save(key, promise, { cacheValue: config.allowCache })
            })
    }
}

