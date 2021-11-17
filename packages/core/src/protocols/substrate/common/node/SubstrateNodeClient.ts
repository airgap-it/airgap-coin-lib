import { RPCBody } from '../../../../data/RPCBody'
import axios, { AxiosError } from '../../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { Cache } from '../../../../utils/cache'
import { NetworkError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { addHexPrefix, bytesToHex, stripHexPrefix, toHexString } from '../../../../utils/hex'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { SubstrateAccountInfo } from '../data/account/SubstrateAccountInfo'
import { SubstrateRegistration } from '../data/account/SubstrateRegistration'
import { SubstrateCall } from '../data/metadata/decorator/call/SubstrateCall'
import { MetadataDecorator } from '../data/metadata/decorator/MetadataDecorator'
import { Metadata } from '../data/metadata/Metadata'
import { SCALEAccountId } from '../data/scale/type/SCALEAccountId'
import { SCALEArray } from '../data/scale/type/SCALEArray'
import { SCALECompactInt } from '../data/scale/type/SCALECompactInt'
import { SCALEData } from '../data/scale/type/SCALEData'
import { SCALEEnum } from '../data/scale/type/SCALEEnum'
import { SCALEInt } from '../data/scale/type/SCALEInt'
import { SCALETuple } from '../data/scale/type/SCALETuple'
import { SCALEType } from '../data/scale/type/SCALEType'
import { SubstrateActiveEraInfo } from '../data/staking/SubstrateActiveEraInfo'
import { SubstrateEraElectionStatus } from '../data/staking/SubstrateEraElectionStatus'
import { SubstrateEraRewardPoints } from '../data/staking/SubstrateEraRewardPoints'
import { SubstrateExposure } from '../data/staking/SubstrateExposure'
import { SubstrateNominations } from '../data/staking/SubstrateNominations'
import { SubstratePayee } from '../data/staking/SubstratePayee'
import { SubstrateSlashingSpans } from '../data/staking/SubstrateSlashingSpans'
import { SubstrateStakingLedger } from '../data/staking/SubstrateStakingLedger'
import { SubstrateValidatorPrefs } from '../data/staking/SubstrateValidatorPrefs'
import { SubstrateRuntimeVersion } from '../data/state/SubstrateRuntimeVersion'
import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'

import {
  SubstrateCallEndpoints,
  SubstrateCallModuleName,
  SubstrateCallName,
  SubstrateConstantModuleName,
  SubstrateConstantName,
  SubstrateRpcMethodName,
  SubstrateRpcModuleName,
  SubstrateStorageEntryName,
  SubstrateStorageModuleName,
  supportedCallEndpoints,
  supportedCalls,
  supportedConstants,
  supportedStorageEntries
} from './supported'
import { SubstrateCompatAddressType } from '../../compat/SubstrateCompatAddress'

interface ConnectionConfig {
  allowCache: boolean
}

const CACHE_DEFAULT_EXPIRATION_TIME = 3000 // 3s

export class SubstrateNodeClient<Network extends SubstrateNetwork> {
  protected metadata: MetadataDecorator | undefined
  protected runtimeVersion: number | undefined
  protected readonly lastFees: Map<SubstrateTransactionType, BigNumber> = new Map()

  protected initApiPromise: Promise<void> | null = null

  public constructor(
    protected readonly network: Network,
    protected readonly baseURL: string,
    protected readonly storageEntries: Object = supportedStorageEntries,
    protected readonly calls: Object = supportedCalls,
    protected readonly constants: Object = supportedConstants,
    protected readonly callEndpoints: SubstrateCallEndpoints = supportedCallEndpoints,
    protected readonly cache: Cache = new Cache(CACHE_DEFAULT_EXPIRATION_TIME)
  ) {}

  public async getAccountInfo(address: SubstrateCompatAddressType[Network]): Promise<SubstrateAccountInfo | null> {
    return this.fromStorage('System', 'Account', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SubstrateAccountInfo.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getExistentialDeposit(): Promise<BigNumber> {
    return this.getConstant('Balances', 'ExistentialDeposit').then((constant) => SCALEInt.decode(constant).decoded.value)
  }

  public async getTransactionMetadata(type: SubstrateTransactionType): Promise<SubstrateCall> {
    const [methodName, callName] = this.callEndpoints.get(type) || [null, null]

    let call: SubstrateCall | null = null
    if (methodName && callName) {
      call = await this.getCall(methodName, callName)
    }

    return call ? call : Promise.reject('Could not find requested transaction.')
  }

  public async getTransferFeeEstimate(transaction: Uint8Array | string): Promise<BigNumber | null> {
    return this.send('payment', 'queryInfo', [bytesToHex(transaction)]).then((result) => (result ? new BigNumber(result.partialFee) : null))
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

  public async getFirstBlockHash(): Promise<string | null> {
    return this.getBlockHash(0)
  }

  public async getLastBlockHash(): Promise<string | null> {
    return this.getBlockHash()
  }

  public async getCurrentHeight(): Promise<BigNumber> {
    return this.send('chain', 'getBlock').then((result) => new BigNumber(stripHexPrefix(result.block.header.number), 16))
  }

  public async getCurrentEraIndex(): Promise<BigNumber | null> {
    return this.fromStorage('Staking', 'CurrentEra').then((item) => (item ? SCALEInt.decode(item).decoded.value : null))
  }

  public async getRuntimeVersion(): Promise<SubstrateRuntimeVersion | null> {
    return this.send('state', 'getRuntimeVersion').catch(() => null)
  }

  public async getBonded(address: SubstrateCompatAddressType[Network]): Promise<SubstrateCompatAddressType[Network] | null> {
    return this.fromStorage('Staking', 'Bonded', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SCALEAccountId.decode(this.network, item).decoded.address : null
    )
  }

  public async getNominations(address: SubstrateCompatAddressType[Network]): Promise<SubstrateNominations<Network> | null> {
    return this.fromStorage('Staking', 'Nominators', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SubstrateNominations.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getRewardPoints(eraIndex: number): Promise<SubstrateEraRewardPoints<Network> | null> {
    return this.fromStorage('Staking', 'ErasRewardPoints', SCALEInt.from(eraIndex, 32)).then((item) =>
      item ? SubstrateEraRewardPoints.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getValidatorReward(eraIndex: number): Promise<BigNumber | null> {
    return this.fromStorage('Staking', 'ErasValidatorReward', SCALEInt.from(eraIndex, 32)).then((item) =>
      item ? SCALEInt.decode(item).decoded.value : null
    )
  }

  public async getStakersClipped(
    eraIndex: number,
    validator: SubstrateCompatAddressType[Network]
  ): Promise<SubstrateExposure<Network> | null> {
    return this.fromStorage(
      'Staking',
      'ErasStakersClipped',
      SCALEInt.from(eraIndex, 32),
      SCALEAccountId.from(validator, this.network)
    ).then((item) => (item ? SubstrateExposure.decode(this.network, this.runtimeVersion, item) : null))
  }

  public async getRewardDestination(address: SubstrateCompatAddressType[Network]): Promise<SubstratePayee | null> {
    return this.fromStorage('Staking', 'Payee', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SCALEEnum.decode(item, (hex) => SubstratePayee[SubstratePayee[hex]]).decoded.value : null
    )
  }

  public async getStakingLedger(address: SubstrateCompatAddressType[Network]): Promise<SubstrateStakingLedger<Network> | null> {
    return this.fromStorage('Staking', 'Ledger', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SubstrateStakingLedger.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getValidators(): Promise<SubstrateCompatAddressType[Network][] | null> {
    return this.fromStorage('Session', 'Validators').then((items) =>
      items
        ? SCALEArray.decode(this.network, this.runtimeVersion, items, (network, _, hex) =>
            SCALEAccountId.decode(network, hex)
          ).decoded.elements.map((encoded) => encoded.address)
        : null
    )
  }

  public async getValidatorExposure(
    eraIndex: number,
    address: SubstrateCompatAddressType[Network]
  ): Promise<SubstrateExposure<Network> | null> {
    return this.fromStorage('Staking', 'ErasStakers', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address, this.network)).then(
      (item) => (item ? SubstrateExposure.decode(this.network, this.runtimeVersion, item) : null)
    )
  }

  public async getElectionStatus(): Promise<SubstrateEraElectionStatus | null> {
    return this.fromStorage('Staking', 'EraElectionStatus').then((item) =>
      item ? SubstrateEraElectionStatus.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getIdentityOf(address: SubstrateCompatAddressType[Network]): Promise<SubstrateRegistration | null> {
    return this.fromStorage('Identity', 'IdentityOf', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SubstrateRegistration.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getSuperOf(address: SubstrateCompatAddressType[Network]): Promise<SCALETuple<SCALEAccountId<Network>, SCALEData> | null> {
    return this.fromStorage('Identity', 'SuperOf', SCALEAccountId.from(address, this.network)).then((item) =>
      item
        ? SCALETuple.decode(
            this.network,
            this.runtimeVersion,
            item,
            (network, _, hex) => SCALEAccountId.decode(network, hex),
            (_network, _runtimeVersion, hex) => SCALEData.decode(hex)
          ).decoded
        : null
    )
  }

  public async getSubsOf(
    address: SubstrateCompatAddressType[Network]
  ): Promise<SCALETuple<SCALECompactInt, SCALEArray<SCALEAccountId<Network>>> | null> {
    return this.fromStorage('Identity', 'SubsOf', SCALEAccountId.from(address, this.network)).then((item) =>
      item
        ? SCALETuple.decode(
            this.network,
            this.runtimeVersion,
            item,
            (_network, _runtimeVersion, hex) => SCALECompactInt.decode(hex),
            (network, _, hex) =>
              SCALEArray.decode(network, _, hex, (innerNetwork, _, innerHex) => SCALEAccountId.decode(innerNetwork, innerHex))
          ).decoded
        : null
    )
  }

  public async getValidatorPrefs(eraIndex: number, address: SubstrateCompatAddressType[Network]): Promise<SubstrateValidatorPrefs | null> {
    return this.fromStorage('Staking', 'ErasValidatorPrefs', SCALEInt.from(eraIndex, 32), SCALEAccountId.from(address, this.network)).then(
      (item) => (item ? SubstrateValidatorPrefs.decode(this.network, this.runtimeVersion, item) : null)
    )
  }

  public async getExpectedEraDuration(): Promise<BigNumber | null> {
    const constants = await Promise.all([
      this.getConstant('Babe', 'ExpectedBlockTime'),
      this.getConstant('Babe', 'EpochDuration'),
      this.getConstant('Staking', 'SessionsPerEra')
    ]).then((constants) => constants.map((constant) => (constant ? SCALEInt.decode(constant).decoded.value : null)))

    if (constants.some((constant) => constant === null)) {
      return null
    }

    const expectedBlockTime = constants[0]!
    const epochDuration = constants[1]!
    const sessionsPerEra = constants[2]!

    return expectedBlockTime.multipliedBy(epochDuration).multipliedBy(sessionsPerEra)
  }

  public async getActiveEraInfo(): Promise<SubstrateActiveEraInfo | null> {
    return this.fromStorage('Staking', 'ActiveEra').then((item) =>
      item ? SubstrateActiveEraInfo.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async getSlashingSpan(address: SubstrateCompatAddressType[Network]): Promise<SubstrateSlashingSpans | null> {
    return this.fromStorage('Staking', 'SlashingSpans', SCALEAccountId.from(address, this.network)).then((item) =>
      item ? SubstrateSlashingSpans.decode(this.network, this.runtimeVersion, item) : null
    )
  }

  public async submitTransaction(encoded: string): Promise<string> {
    return this.send('author', 'submitExtrinsic', [encoded], { allowCache: false })
  }

  protected async getBlockHash(blockNumber?: number): Promise<string | null> {
    return this.send('chain', 'getBlockHash', blockNumber !== undefined ? [toHexString(blockNumber)] : [])
  }

  protected async fromStorage<M extends SubstrateStorageModuleName, E extends SubstrateStorageEntryName<M>>(
    moduleName: M,
    entryName: E,
    ...args: SCALEType[]
  ): Promise<string | null> {
    await this.initApi()
    const storageEntry = this.metadata?.storageEntry(moduleName, entryName)

    if (!storageEntry) {
      console.warn(`Could not find requested item: ${moduleName} ${entryName}`)

      return null
    }

    const hash = await storageEntry.hash(...args)
    const result = await this.send('state', 'getStorage', [hash])

    return result
  }

  protected async getCall<M extends SubstrateCallModuleName, C extends SubstrateCallName<M>>(
    moduleName: M,
    callName: C
  ): Promise<SubstrateCall> {
    await this.initApi()
    const call = this.metadata?.call(moduleName, callName)

    return call ? call : Promise.reject(`Could not find requested item: ${moduleName} ${callName}`)
  }

  protected async getConstant<M extends SubstrateConstantModuleName, C extends SubstrateConstantName<M>>(
    moduleName: M,
    constantName: C
  ): Promise<string> {
    await this.initApi()
    const constant = this.metadata?.constant(moduleName, constantName)

    return constant ? constant.value.toString('hex') : Promise.reject(`Could not find requested item: ${moduleName} ${constantName}`)
  }

  protected async initApi(): Promise<void> {
    if (!this.initApiPromise) {
      const initApiPromise = new Promise<void>(async (resolve, reject) => {
        const [metadataEncoded, runtimeVersion] = await Promise.all([this.send('state', 'getMetadata'), this.getRuntimeVersion()])
        if (!runtimeVersion) {
          reject('Could not fetch runtime version from the node')
        }
        this.metadata = Metadata.decode(this.network, runtimeVersion?.specVersion, metadataEncoded).decorate(
          this.storageEntries,
          this.calls,
          this.constants
        )
        this.runtimeVersion = runtimeVersion?.specVersion

        resolve()
      }).then(async () => {
        this.initApiPromise = Promise.resolve()
        await this.initCache()
      })

      this.initApiPromise = initApiPromise.catch((error) => {
        console.warn(error)
        this.initApiPromise = initApiPromise // retry once
      })
    }

    return this.initApiPromise
  }

  protected async initCache(): Promise<void> {
    const blockTime = await this.getConstant('Babe', 'ExpectedBlockTime')
      .then((constant) => SCALEInt.decode(constant).decoded.toNumber())
      .catch(() => 6000)

    this.cache.expirationTime = Math.floor(blockTime / 3)
  }

  protected async send<T extends SubstrateRpcModuleName, S extends SubstrateRpcMethodName<T>>(
    module: T,
    method: S,
    params: string[] = [],
    config: ConnectionConfig = { allowCache: true }
  ): Promise<any> {
    const endpoint = `${module}_${method}`
    const key = `${endpoint}$${params.join('')}`

    return this.cache.get(key).catch(() => {
      const promise = axios
        .post(this.baseURL, new RPCBody(endpoint, params.map(addHexPrefix)))
        .then((response) => {
          const data = response.data
          if (data.error) {
            throw data.error
          }

          return data.result
        })
        .catch((error) => {
          if (typeof error === 'string') {
            throw new NetworkError(Domain.SUBSTRATE, {}, error)
          } else {
            throw new NetworkError(Domain.SUBSTRATE, error as AxiosError)
          }
        })

      return this.cache.save(key, promise, { cacheValue: config.allowCache })
    })
  }
}
