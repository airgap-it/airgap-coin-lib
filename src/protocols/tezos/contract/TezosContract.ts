import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import { MichelineDataNode, MichelineNode, MichelinePrimitiveApplication, MichelineTypeNode } from '../types/micheline/MichelineNode'
import { MichelsonOr } from '../types/michelson/generics/MichelsonOr'
import { MichelsonType } from '../types/michelson/MichelsonType'
import {
  MichelsonAnnotationPrefix,
  MichelsonTypeMeta,
  MichelsonTypeMetaCreateValueConfiguration
} from '../types/michelson/MichelsonTypeMeta'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { isMichelineNode } from '../types/utils'

import { TezosContractCall } from './TezosContractCall'
import { TezosContractEntrypoint } from './TezosContractEntrypoint'

interface BigMapValuePredicate {
  field: 'key' | 'key_hash' | 'value'
  operation: 'in' | 'between' | 'like' | 'lt' | 'gt' | 'eq' | 'startsWith' | 'endsWith' | 'before' | 'after'
  set: any[]
  inverse?: boolean
}

interface TezosContractCode extends MichelinePrimitiveApplication<any> {
  prim: 'parameter' | 'storage'
  args: MichelineTypeNode[]
}

export interface TezosContractConfiguration {
  address: string
  nodeRPCURL: string
  conseilAPIURL: string
  conseilNetwork: string
  conseilAPIKey: string

  parseDefaultEntrypoint?: boolean
}

export class TezosContract {
  private static readonly DEFAULT_ENTRYPOINT = 'default'

  public entrypoints?: Map<string, TezosContractEntrypoint>
  public entrypointsPromise?: Promise<void>

  public bigMapID?: number
  public bigMapIDPromise?: Promise<void>

  private readonly address: string
  private readonly nodeRPCURL: string
  private readonly conseilAPIURL: string
  private readonly conseilNetwork: string
  private readonly conseilAPIKey: string

  private readonly parseDefaultEntrypoint: boolean

  constructor(configuration: TezosContractConfiguration) {
    this.address = configuration.address
    this.nodeRPCURL = configuration.nodeRPCURL
    this.conseilAPIURL = configuration.conseilAPIURL
    this.conseilNetwork = configuration.conseilNetwork
    this.conseilAPIKey = configuration.conseilAPIKey

    this.parseDefaultEntrypoint = configuration.parseDefaultEntrypoint !== undefined ? configuration.parseDefaultEntrypoint : true
  }

  public async bigMapValue(key: string, isKeyHash: boolean = false): Promise<string | null> {
    await this.waitForBigMapID()

    const predicates: { field: string; operation: string; set: any[] }[] = [
      {
        field: 'big_map_id',
        operation: 'eq',
        set: [this.bigMapID]
      }
    ]
    if (isKeyHash) {
      predicates.push({
        field: 'key_hash',
        operation: 'eq',
        set: [key]
      })
    } else {
      predicates.push({
        field: 'key',
        operation: 'eq',
        set: [key]
      })
    }

    const response: Record<'value', string | null>[] = await this.apiRequest('/big_map_contents', {
      fields: ['value'],
      predicates,
      limit: 1
    })

    if (response.length === 0) {
      return null
    }

    return response[0].value
  }

  public async bigMapValues(predicates: BigMapValuePredicate[]): Promise<{ key: string; value: string | null }[]> {
    await this.waitForBigMapID()

    return this.apiRequest<{ key: string; value: string | null }[]>('/big_map_contents', {
      fields: ['key', 'value'],
      predicates: [
        {
          field: 'big_map_id',
          operation: 'eq',
          set: [this.bigMapID],
          inverse: false
        },
        ...predicates
      ]
    })
  }

  public async createContractCall(entrypointName: string, ...args: unknown[]): Promise<TezosContractCall> {
    await this.waitForEntrypoints()

    const entrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(entrypointName)
    if (!entrypoint) {
      return this.createDefaultContractCall(...args)
    }

    return this.createEntrypointContractCall(entrypoint, { values: args })
  }

  public async parseContractCall(json: TezosTransactionParameters): Promise<TezosContractCall> {
    await this.waitForEntrypoints()

    const entrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(json.entrypoint)
    if (!entrypoint) {
      return Promise.reject(`Couldn't parse the contract call, unknown entrypoint: ${json.entrypoint}`)
    }

    const parameterRegistry: Map<string, MichelsonType> = new Map()

    return this.createEntrypointContractCall(entrypoint, {
      lazyEval: false,
      onNext: (meta: MichelsonTypeMeta, _raw: unknown, value: MichelsonType): void => {
        const argName: string | undefined = meta.getAnnotation(MichelsonAnnotationPrefix.ARG)
        if (argName) {
          parameterRegistry.set(argName, value)
        }
      },
      values: json.value,
    }, parameterRegistry)
  }

  public async normalizeContractCallParameters(
    json: Partial<TezosTransactionParameters> & Pick<TezosTransactionParameters, 'value'> | MichelineDataNode, 
    fallbackEntrypoint?: string
  ): Promise<TezosTransactionParameters> {
    const entrypoint: string | undefined = 'entrypoint' in json ? json.entrypoint : undefined
    const value: MichelineNode = 'value' in json ? json.value : json

    if (entrypoint !== undefined && entrypoint !== TezosContract.DEFAULT_ENTRYPOINT) {
      return {
        entrypoint,
        value
      }
    }

    if (!MichelsonOr.isOr(value)) {
      return {
        entrypoint: fallbackEntrypoint ?? TezosContract.DEFAULT_ENTRYPOINT,
        value
      }
    }

    await this.waitForEntrypoints()

    const defaultEntrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(TezosContract.DEFAULT_ENTRYPOINT)
    if (!defaultEntrypoint) {
      throw new Error('Could not fetch default entrypoint.')
    }

    let normalizedEntrypoint: [string, MichelineNode] | undefined
    defaultEntrypoint.type.createValue({
      beforeNext: (meta: MichelsonTypeMeta, raw: unknown): void => {
        const entrypointName: string | undefined = meta.getAnnotation(MichelsonAnnotationPrefix.ENTRYPOINT)
        if (entrypointName && isMichelineNode(raw)) {
          normalizedEntrypoint = [entrypointName, raw]
        }
      },
      onNext: (_meta: MichelsonTypeMeta, _raw: unknown, michelsonValue: MichelsonType): void => {
        if (michelsonValue instanceof MichelsonOr) {
          michelsonValue.eval()
        }
      },
      values: value
    })

    return {
      entrypoint: normalizedEntrypoint ? normalizedEntrypoint[0] : (fallbackEntrypoint ?? defaultEntrypoint.name),
      value: normalizedEntrypoint ? normalizedEntrypoint[1] : value
    }
  }

  private createDefaultContractCall(...args: unknown[]): TezosContractCall {
    return new TezosContractCall(TezosContract.DEFAULT_ENTRYPOINT, args[0] instanceof MichelsonType ? args[0] : undefined)
  }

  private createEntrypointContractCall(
    entrypoint: TezosContractEntrypoint, 
    configuration: MichelsonTypeMetaCreateValueConfiguration,
    parameterRegistry?: Map<string, MichelsonType>
  ): TezosContractCall {
    return new TezosContractCall(entrypoint.name, entrypoint.type.createValue(configuration), parameterRegistry)
  }

  private async waitForBigMapID(): Promise<void> {
    if (this.bigMapID !== undefined) {
      return
    }

    if (this.bigMapIDPromise === undefined) {
      this.bigMapIDPromise = this.apiRequest<Record<'big_map_id', number>[]>('/originated_account_maps', {
        fields: ['big_map_id'],
        predicates: [
          {
            field: 'account_id',
            operation: 'eq',
            set: [this.address]
          }
        ],
        limit: 1
      })
        .then((bigMapIDResponse) => {
          if (bigMapIDResponse.length === 0) {
            throw new Error('BigMap ID not found')
          }

          this.bigMapID = bigMapIDResponse[0].big_map_id
        })
        .finally(() => {
          this.bigMapIDPromise = undefined
        })
    }

    return this.bigMapIDPromise
  }

  private async waitForEntrypoints(): Promise<void> {
    if (this.entrypoints !== undefined) {
      return
    }

    if (this.entrypointsPromise === undefined) {
      const codePromise: Promise<Record<'code', TezosContractCode[]>> = this.nodeRequest('script')
      const entrypointsPromise: Promise<Record<'entrypoints', Record<string, MichelineTypeNode>>> = this.nodeRequest('entrypoints')

      this.entrypointsPromise = Promise.all([
        this.parseDefaultEntrypoint ? codePromise : undefined, 
        entrypointsPromise
      ]).then(([codeResponse, entrypointsResponse]) => {
        if (codeResponse && entrypointsResponse.entrypoints[TezosContract.DEFAULT_ENTRYPOINT] === undefined) {
          const parameter = codeResponse.code.find((primitiveApplication) => primitiveApplication.prim === 'parameter')
          if (parameter) {
            entrypointsResponse.entrypoints[TezosContract.DEFAULT_ENTRYPOINT] = parameter.args ? parameter.args[0] : []
          }
        }

        this.entrypoints = new Map(
          TezosContractEntrypoint.fromJSON(entrypointsResponse.entrypoints).map((entrypoint: TezosContractEntrypoint) => 
            [entrypoint.name, entrypoint]
          )
        )
      }).finally(() => {
        this.entrypointsPromise = undefined
      })
    }

    return this.entrypointsPromise
  }

  private async nodeRequest<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await axios.get(
      `${this.nodeRPCURL}/chains/main/blocks/head/context/contracts/${this.address}/${endpoint}`
    )

    return response.data
  }

  private async apiRequest<T>(endpoint: string, body: any): Promise<T> {
    const response: AxiosResponse<T> = await axios.post(
      `${this.conseilAPIURL}/v2/data/tezos/${this.conseilNetwork}/${endpoint}`, 
      body, 
      {
        headers: { 
          'Content-Type': 'application/json', 
          apiKey: this.conseilAPIKey
        }
      }
    )

    return response.data
  }
}