import { Domain, NetworkError } from '@airgap/coinlib-core'
import { RPCBody } from '@airgap/coinlib-core/data/RPCBody'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Cache } from '@airgap/coinlib-core/utils/cache'
import { addHexPrefix, bytesToHex, stripHexPrefix, toHexString } from '@airgap/coinlib-core/utils/hex'
import { normalizeToUndefined } from '@airgap/module-kit'

import { TypedSubstrateAddress } from '../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountInfo } from '../data/account/SubstrateAccountInfo'
import { SubstrateCall } from '../data/metadata/decorator/call/SubstrateCall'
import { MetadataDecorator } from '../data/metadata/decorator/MetadataDecorator'
import { Metadata } from '../data/metadata/Metadata'
import { SCALEAccountId } from '../data/scale/type/SCALEAccountId'
import { SCALEInt } from '../data/scale/type/SCALEInt'
import { SCALEType } from '../data/scale/type/SCALEType'
import { SubstrateRuntimeVersion } from '../data/state/SubstrateRuntimeVersion'
import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateProtocolConfiguration, SubstrateRpcConfiguration } from '../types/configuration'

import { SubstrateNodeClient } from './SubstrateNodeClient'

interface ConnectionConfig {
  allowCache: boolean
}

const DEFAULT_BLOCK_TIME = 6000
const CACHE_DEFAULT_EXPIRATION_TIME = 3000 // 3s
const MAX_RETRIES = 3

export class SubstrateCommonNodeClient<C extends SubstrateProtocolConfiguration> implements SubstrateNodeClient<C> {
  protected metadata: MetadataDecorator | undefined
  protected runtimeVersion: number | undefined
  protected readonly lastFees: Map<SubstrateTransactionType<C>, BigNumber> = new Map()

  protected initApiPromise: Promise<void> | null = null

  protected readonly storageEntries: Record<string, string[]>
  protected readonly calls: Record<string, string[]>
  protected readonly constants: Record<string, string[]>
  protected readonly callEndpoints: SubstrateCallEndpoints<C>

  protected readonly cache: Cache = new Cache(CACHE_DEFAULT_EXPIRATION_TIME)

  public constructor(protected readonly configuration: C, protected readonly url: string) {
    this.storageEntries = this.mergeSupportedCalls(configuration.rpc?.storageEntries ?? {}, commonStorageEntries)
    this.calls = this.mergeSupportedCalls(configuration.rpc?.calls ?? {}, commonCalls)
    this.constants = this.mergeSupportedCalls(configuration.rpc?.constants ?? {}, commonConstants)
    this.callEndpoints = new Map([this.createCallEndpointEntry('transfer', 'Balances', 'transfer_allow_death')])
  }

  public async getAccountInfo(address: TypedSubstrateAddress<C>): Promise<SubstrateAccountInfo | undefined> {
    return this.fromStorage('System', 'Account', SCALEAccountId.from(address, this.configuration)).then((item) =>
      item ? SubstrateAccountInfo.decode(this.configuration, this.runtimeVersion, item) : undefined
    )
  }

  public async getExistentialDeposit(): Promise<BigNumber | undefined> {
    return this.getConstant('Balances', 'ExistentialDeposit').then((constant) => SCALEInt.decode(constant).decoded.value)
  }

  public async getBlockTime(): Promise<BigNumber> {
    return new BigNumber(DEFAULT_BLOCK_TIME)
  }

  public async getFirstBlockHash(): Promise<string | undefined> {
    return this.getBlockHash(0)
  }

  public async getLastBlockHash(): Promise<string | undefined> {
    return this.getBlockHash()
  }

  protected async getBlockHash(blockNumber?: number): Promise<string | undefined> {
    return this.send('chain', 'getBlockHash', blockNumber !== undefined ? [toHexString(blockNumber)] : [])
  }

  public async getCurrentHeight(): Promise<BigNumber> {
    return this.send('chain', 'getBlock').then((result) => new BigNumber(stripHexPrefix(result.block.header.number), 16))
  }

  public async getRuntimeVersion(): Promise<SubstrateRuntimeVersion | undefined> {
    return this.send('state', 'getRuntimeVersion').catch(() => null)
  }

  public async getTransferFeeEstimate(transaction: string | Uint8Array): Promise<BigNumber | undefined> {
    return this.send('payment', 'queryInfo', [bytesToHex(transaction)]).then((result) =>
      result ? new BigNumber(result.partialFee) : undefined
    )
  }

  public saveLastFee(type: SubstrateTransactionType<C>, fee: BigNumber): void {
    this.lastFees.set(type, fee)
  }

  public getSavedLastFee(type: SubstrateTransactionType<C>, defaultValue: 'undefined' | 'largest'): BigNumber | undefined {
    let fee = this.lastFees.get(type)

    if (!fee && defaultValue === 'largest') {
      const savedFees = Array.from(this.lastFees.values())
      fee = savedFees.length > 0 ? BigNumber.max(...savedFees) : undefined
    }

    return fee
  }

  public async getTransactionMetadata(type: SubstrateTransactionType<C>): Promise<SubstrateCall> {
    const [methodName, callName] = this.callEndpoints.get(type) || [null, null]

    let call: SubstrateCall | null = null
    if (methodName && callName) {
      call = await this.getCall(methodName, callName)
    }

    return call ? call : Promise.reject('Could not find requested transaction.')
  }

  public async submitTransaction(encoded: string): Promise<string> {
    return this.send('author', 'submitExtrinsic', [encoded], { allowCache: false })
  }

  protected async fromStorage<Module extends SubstrateStorageModuleName<C>, Entry extends SubstrateStorageEntryName<C, Module>>(
    moduleName: Module,
    entryName: Entry,
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

  protected async getCall<Module extends SubstrateCallModuleName<C>, Call extends SubstrateCallName<C, Module>>(
    moduleName: Module,
    callName: Call
  ): Promise<SubstrateCall> {
    await this.initApi()
    const call = this.metadata?.call(moduleName, callName)

    return call ? call : Promise.reject(`Could not find requested item: ${moduleName} ${callName}`)
  }

  protected async getConstant<Module extends SubstrateConstantModuleName<C>, Constant extends SubstrateConstantName<C, Module>>(
    moduleName: Module,
    constantName: Constant
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
        this.metadata = Metadata.decode(this.configuration, runtimeVersion?.specVersion, metadataEncoded).decorate(
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
    const blockTime = await this.getBlockTime()

    this.cache.expirationTime = Math.floor(blockTime.toNumber() / 3)
  }

  protected async send<T extends SubstrateRpcModuleName<C>, S extends SubstrateRpcMethodName<C, T>>(
    module: T,
    method: S,
    params: string[] = [],
    config: ConnectionConfig = { allowCache: true }
  ): Promise<any> {
    const endpoint = `${module}_${method}`
    const key = `${endpoint}$${params.join('')}`

    const result = await this.cache.get(key).catch(() => {
      const promise = this.sendRepeat(endpoint, params)
      return this.cache.save(key, promise, { cacheValue: config.allowCache })
    })

    return normalizeToUndefined(result)
  }

  private async sendRepeat(endpoint: string, params: string[], attempts: number = 0): Promise<any> {
    const handleResponse = (response: AxiosResponse<any>) => {
      const data = response.data
      if (data.error) {
        throw data.error
      }

      return data.result
    }

    const handleAxiosError = async (error: AxiosError) => {
      if (error.response?.status === 500 && attempts < MAX_RETRIES) {
        return await this.sendRepeat(endpoint, params, attempts + 1)
      } else {
        throw new NetworkError(Domain.SUBSTRATE, error)
      }
    }

    const handleError = async (error: any) => {
      if (typeof error === 'string') {
        throw new NetworkError(Domain.SUBSTRATE, {}, error)
      } else {
        const axiosError = error as AxiosError
        return await handleAxiosError(axiosError)
      }
    }

    return axios
      .post(this.url, new RPCBody(endpoint, params.map(addHexPrefix)))
      .then(handleResponse)
      .catch(handleError)
  }

  protected registerCallEntrypointEntries(
    entries: [SubstrateTransactionType<C>, [SubstrateCallModuleName<C>, SubstrateCallName<C, any>]][]
  ) {
    entries.forEach(([transactionType, entry]) => {
      this.callEndpoints.set(transactionType, entry)
    })
  }

  protected createCallEndpointEntry<Module extends SubstrateCallModuleName<C>, Call extends SubstrateCallName<C, Module>>(
    transactionType: SubstrateTransactionType<C>,
    moduleName: Module,
    callName: Call
  ): [SubstrateTransactionType<C>, [SubstrateCallModuleName<C>, SubstrateCallName<C, any>]] {
    return [transactionType, [moduleName, callName]]
  }

  protected mergeSupportedCalls(
    configured: Record<string, Readonly<string[]>>,
    common: Record<string, Readonly<string[]>>
  ): Record<string, string[]> {
    return Object.entries(configured as Record<string, string[]>)
      .concat(Object.entries(common as Record<string, string[]>))
      .reduce(
        (obj: Record<string, string[]>, next: [string, string[]]) =>
          Object.assign(obj, { [next[0]]: (obj[next[0]] ?? []).concat(next[1]) }),
        {}
      )
  }
}

// Supported Calls

const commonRpcMethods = {
  author: ['submitExtrinsic'] as const,
  chain: ['getBlock', 'getBlockHash'] as const,
  state: ['getMetadata', 'getStorage', 'getRuntimeVersion'] as const,
  payment: ['queryInfo'] as const
}

export type SubstrateRpcModuleName<C extends SubstrateProtocolConfiguration> = ModuleName<C, 'methods', typeof commonRpcMethods>
export type SubstrateRpcMethodName<C extends SubstrateProtocolConfiguration, T extends SubstrateRpcModuleName<C>> = ModuleEntry<
  C,
  'methods',
  typeof commonRpcMethods,
  T
>

const commonStorageEntries = {
  System: ['Account'] as const
}

type SubstrateStorageModuleName<C extends SubstrateProtocolConfiguration> = ModuleName<C, 'storageEntries', typeof commonStorageEntries>
type SubstrateStorageEntryName<C extends SubstrateProtocolConfiguration, T extends SubstrateStorageModuleName<C>> = ModuleEntry<
  C,
  'storageEntries',
  typeof commonStorageEntries,
  T
>

const commonCalls = {
  Balances: ['transfer_allow_death'] as const
}

type SubstrateCallModuleName<C extends SubstrateProtocolConfiguration> = ModuleName<C, 'calls', typeof commonCalls>
type SubstrateCallName<C extends SubstrateProtocolConfiguration, T extends SubstrateCallModuleName<C>> = ModuleEntry<
  C,
  'calls',
  typeof commonCalls,
  T
>

const commonConstants = {
  Balances: ['ExistentialDeposit'] as const
}

type SubstrateConstantModuleName<C extends SubstrateProtocolConfiguration> = ModuleName<C, 'constants', typeof commonConstants>
type SubstrateConstantName<C extends SubstrateProtocolConfiguration, T extends SubstrateConstantModuleName<C>> = ModuleEntry<
  C,
  'constants',
  typeof commonConstants,
  T
>

type SubstrateCallEndpoints<C extends SubstrateProtocolConfiguration> = Map<
  SubstrateTransactionType<C>,
  [SubstrateCallModuleName<C>, SubstrateCallName<C, any>]
>

type ModuleName<C extends SubstrateProtocolConfiguration, Type extends keyof SubstrateRpcConfiguration, Defaults extends Object> =
  | keyof Defaults
  | (C['rpc'] extends Object ? (keyof C['rpc'][Type] extends string ? keyof C['rpc'][Type] : never) : never)

type ModuleEntry<
  C extends SubstrateProtocolConfiguration,
  Type extends keyof SubstrateRpcConfiguration,
  Defaults extends Record<string, Readonly<string[]>>,
  T extends ModuleName<C, Type, Defaults>
> = ReadonlyEntries<T, Defaults> | (C['rpc'] extends Object ? ReadonlyEntries<T, C['rpc'][Type]> : never)

type ReadonlyEntries<T, C> = T extends keyof C ? { [S in T]: C[S] extends Readonly<string[]> ? C[S][number] : never }[T] : never
