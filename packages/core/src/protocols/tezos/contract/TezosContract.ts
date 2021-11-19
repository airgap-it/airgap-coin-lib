import axios, { AxiosError, AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError, NetworkError, NotFoundError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import { recursivelyFind } from '../../../utils/object'
import { RemoteData } from '../../../utils/remote-data/RemoteData'
import { RemoteDataFactory } from '../../../utils/remote-data/RemoteDataFactory'
import { trimStart } from '../../../utils/string'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { BigMapPredicate } from '../types/contract/BigMapPredicate'
import { BigMapRequest } from '../types/contract/BigMapRequest'
import { BigMapResponse } from '../types/contract/BigMapResult'
import { TezosContractMetadata } from '../types/contract/TezosContractMetadata'
import { MichelineNode, MichelineTypeNode } from '../types/micheline/MichelineNode'
import { MichelineNodeUtils } from '../types/micheline/MichelineNodeUtils'
import { MichelsonOr } from '../types/michelson/generics/MichelsonOr'
import { MichelsonType } from '../types/michelson/MichelsonType'
import {
  MichelsonAnnotationPrefix,
  MichelsonTypeMeta,
  MichelsonTypeMetaCreateValueConfiguration
} from '../types/michelson/MichelsonTypeMeta'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosContractCode } from '../types/TezosContractCode'
import { isMichelineNode } from '../types/utils'
import { TezosContractRemoteDataFactory } from './remote-data/TezosContractRemoteDataFactory'

import { TezosContractCall } from './TezosContractCall'
import { TezosContractEntrypoint } from './TezosContractEntrypoint'
import { TezosContractStorage } from './TezosContractStorage'

export class TezosContract {
  private static readonly DEFAULT_ENTRYPOINT = 'default'

  public entrypoints?: Map<string, TezosContractEntrypoint>
  public storage?: TezosContractStorage
  private codePromise?: Promise<void>

  public bigMapIDs?: number[]
  private bigMapIDsPromise?: Promise<void>

  private readonly remoteDataFactory: RemoteDataFactory = new TezosContractRemoteDataFactory()

  constructor(
    public readonly address: string,
    public readonly network: TezosNetwork,
    private readonly nodeRPCURL: string,
    private readonly conseilAPIURL: string,
    private readonly conseilNetwork: string,
    private readonly conseilAPIKey: string
  ) {}

  public copy(
    values: {
      address?: string
      network?: TezosNetwork
      nodeRPCURL?: string
      conseilAPIURL?: string
      conseilNetwork?: string
      conseilAPIKey?: string
    } = {}
  ): TezosContract {
    return new TezosContract(
      values.address ?? this.address,
      values.network ?? this.network,
      values.nodeRPCURL ?? this.nodeRPCURL,
      values.conseilAPIURL ?? this.conseilAPIURL,
      values.conseilNetwork ?? this.conseilNetwork,
      values.conseilAPIKey ?? this.conseilAPIKey
    )
  }

  public async findBigMap(name: string): Promise<number | undefined> {
    const storage = await this.readStorage()
    return recursivelyFind<BigNumber>(storage?.asRawValue(), name)?.toNumber()
  }

  public async bigMapValue(bigMapID: number, valueSchema: MichelineTypeNode): Promise<MichelsonType | undefined>
  public async bigMapValue(
    bigMapID: number,
    key: unknown,
    keySchema: MichelineTypeNode,
    valueSchema: MichelineTypeNode
  ): Promise<MichelsonType | undefined>
  public async bigMapValue(
    bigMapID: number,
    keyOrValueSchema: unknown,
    keySchemaOrUndefined?: MichelineTypeNode,
    valueSchemaOrUndefined?: MichelineTypeNode
  ): Promise<MichelsonType | undefined> {
    let expr: string | undefined
    let valueSchema: MichelineTypeNode | undefined
    if (keySchemaOrUndefined && valueSchemaOrUndefined) {
      const michelsonKey = MichelsonTypeMeta.fromMichelineNode(keySchemaOrUndefined)?.createValue(keyOrValueSchema)
      if (!michelsonKey) {
        return undefined
      }

      expr = await TezosUtils.encodeExpr(michelsonKey)
      valueSchema = valueSchemaOrUndefined
    } else if (!keySchemaOrUndefined && !valueSchemaOrUndefined) {
      valueSchema = keyOrValueSchema as MichelineTypeNode
    }

    if (!valueSchema) {
      return undefined
    }

    const value = await this.bigMapRequest(bigMapID, expr)
    return value ? MichelsonTypeMeta.fromMichelineNode(valueSchema)?.createValue(value) : undefined
  }

  public async bigMapValues(bigMapID: number, valueSchema: MichelineTypeNode): Promise<MichelsonType[]> {
    const values = await this.bigMapRequest(bigMapID, '')
    if (!Array.isArray(values)) {
      return []
    }

    return values
      ?.map((value) => MichelsonTypeMeta.fromMichelineNode(valueSchema)?.createValue(value))
      ?.filter((value) => value !== undefined) as MichelsonType[]
  }

  public async conseilBigMapValues(request: BigMapRequest = {}): Promise<BigMapResponse[]> {
    const bigMapID: number = request?.bigMapID ?? (await this.getBigMapID(request.bigMapFilter))

    const predicates: { field: string; operation: string; set: any[] }[] = [
      {
        field: 'big_map_id',
        operation: 'eq',
        set: [bigMapID]
      },
      ...(request.predicates ?? [])
    ]

    return this.conseilRequest('/big_map_contents', {
      fields: ['key', 'key_hash', 'value'],
      predicates,
      limit: request.limit ?? 100000
    })
  }

  public async readStorage(): Promise<MichelsonType | undefined> {
    await this.waitForContractCode()
    if (this.storage === undefined) {
      return undefined
    }

    const storageContent = await this.contractRequest('/storage/normalized', { unparsing_mode: 'Optimized_legacy' })
    return this.storage.type.createValue(storageContent)
  }

  public async metadata(): Promise<TezosContractMetadata | undefined> {
    const bigMapID = await this.findBigMap('metadata')
    if (bigMapID === undefined) {
      return undefined
    }

    const remoteData = await this.getMetadataRemoteData(bigMapID)
    return remoteData?.get()
  }

  public async balance(): Promise<string> {
    return this.contractRequest('/balance')
  }

  public async createContractCall(entrypointName: string, value: unknown, amount?: BigNumber): Promise<TezosContractCall> {
    await this.waitForContractCode()

    const entrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(entrypointName)
    if (!entrypoint) {
      return this.createDefaultContractCall(value, amount)
    }

    return this.createEntrypointContractCall(entrypoint, value, undefined, amount)
  }

  public async parseContractCall(json: TezosTransactionParameters): Promise<TezosContractCall> {
    await this.waitForContractCode()

    const entrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(json.entrypoint)
    if (!entrypoint) {
      return Promise.reject(`Couldn't parse the contract call, unknown entrypoint: ${json.entrypoint}`)
    }

    return this.createEntrypointContractCall(entrypoint, json.value, { lazyEval: false })
  }

  public areValidParameters(data: unknown): boolean {
    try {
      const parameters: unknown = typeof data === 'string' ? JSON.parse(data) : data

      return parameters instanceof Object && 'entrypoint' in parameters && 'value' in parameters
    } catch {
      return false
    }
  }

  public parseParameters(parameters: string): TezosTransactionParameters {
    if (!this.areValidParameters(parameters)) {
      throw new Error('Invalid parameters')
    }

    return JSON.parse(parameters) as TezosTransactionParameters
  }

  public async normalizeContractCallParameters(
    json: (Partial<TezosTransactionParameters> & Pick<TezosTransactionParameters, 'value'>) | MichelineNode,
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

    await this.waitForContractCode()

    const defaultEntrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(TezosContract.DEFAULT_ENTRYPOINT)
    if (!defaultEntrypoint) {
      throw new InvalidValueError(Domain.TEZOS, 'Could not fetch default entrypoint.')
    }

    let normalizedEntrypoint: [string, MichelineNode] | undefined
    defaultEntrypoint.type.createValue(value, {
      readAnnots: false,
      beforeNext: (meta: MichelsonTypeMeta, raw: unknown): void => {
        const entrypointName: string | undefined = meta.getAnnotation(MichelsonAnnotationPrefix.FIELD)
        if (entrypointName && isMichelineNode(raw)) {
          normalizedEntrypoint = [entrypointName, raw]
        }
      },
      onNext: (_meta: MichelsonTypeMeta, _raw: unknown, michelsonValue: MichelsonType): void => {
        if (michelsonValue instanceof MichelsonOr) {
          michelsonValue.eval()
        }
      }
    })

    return {
      entrypoint: normalizedEntrypoint ? normalizedEntrypoint[0] : fallbackEntrypoint ?? defaultEntrypoint.name,
      value: normalizedEntrypoint ? normalizedEntrypoint[1] : value
    }
  }

  private createDefaultContractCall(value: unknown, amount?: BigNumber): TezosContractCall {
    return new TezosContractCall(TezosContract.DEFAULT_ENTRYPOINT, value instanceof MichelsonType ? value : undefined, amount)
  }

  private createEntrypointContractCall(
    entrypoint: TezosContractEntrypoint,
    value: unknown,
    configuration: MichelsonTypeMetaCreateValueConfiguration = {},
    amount?: BigNumber
  ): TezosContractCall {
    return new TezosContractCall(entrypoint.name, entrypoint.type.createValue(value, configuration), amount)
  }

  private async getBigMapID(predicates?: BigMapPredicate[]): Promise<number> {
    await this.waitForBigMapIDs()

    if (this.bigMapIDs?.length === 1) {
      return this.bigMapIDs[0]
    }

    if (!predicates) {
      throw new InvalidValueError(Domain.TEZOS, 'Contract has more than one BigMap, provide ID or predicates to select one.')
    }

    const response = await this.conseilRequest<Record<'big_map_id', number>[]>('/big_maps', {
      fields: ['big_map_id'],
      predicates: [
        {
          field: 'big_map_id',
          operation: 'in',
          set: this.bigMapIDs
        },
        ...predicates
      ]
    })

    if (response.length === 0) {
      throw new InvalidValueError(Domain.TEZOS, 'BigMap ID not found')
    }

    if (response.length > 1) {
      throw new InvalidValueError(Domain.TEZOS, 'More than one BigMap ID has been found for the predicates.')
    }

    return response[0].big_map_id
  }

  private async waitForBigMapIDs(): Promise<void> {
    if (this.bigMapIDs !== undefined) {
      return
    }

    if (this.bigMapIDsPromise === undefined) {
      this.bigMapIDsPromise = this.conseilRequest<Record<'big_map_id', number>[]>('/originated_account_maps', {
        fields: ['big_map_id'],
        predicates: [
          {
            field: 'account_id',
            operation: 'eq',
            set: [this.address]
          }
        ]
      })
        .then((response) => {
          if (response.length === 0) {
            throw new NotFoundError(Domain.TEZOS, 'BigMap IDs not found')
          }

          this.bigMapIDs = response.map((entry) => entry.big_map_id)
        })
        .finally(() => {
          this.bigMapIDsPromise = undefined
        })
    }

    return this.bigMapIDsPromise
  }

  private async waitForContractCode(): Promise<void> {
    if (this.entrypoints !== undefined && this.storage !== undefined) {
      return
    }

    if (this.codePromise === undefined) {
      const scriptPromise: Promise<Record<'code', TezosContractCode[]>> = this.contractRequest('/script/normalized', {
        unparsing_mode: 'Optimized_legacy'
      })
      const entrypointsPromise: Promise<Record<'entrypoints', Record<string, MichelineTypeNode>>> = this.contractRequest('/entrypoints')

      this.codePromise = Promise.all([scriptPromise, entrypointsPromise])
        .then(([scriptResponse, entrypointsResponse]) => {
          if (entrypointsResponse.entrypoints[TezosContract.DEFAULT_ENTRYPOINT] === undefined) {
            const parameter = scriptResponse.code.find((primitiveApplication) => primitiveApplication.prim === 'parameter')
            if (parameter) {
              const normalizedParameter = parameter ? this.normalizeContractCode(parameter) : undefined
              entrypointsResponse.entrypoints[TezosContract.DEFAULT_ENTRYPOINT] = normalizedParameter?.args
                ? normalizedParameter.args[0]
                : []
            }
          }

          this.entrypoints = new Map(
            TezosContractEntrypoint.fromJSON(entrypointsResponse.entrypoints).map((entrypoint: TezosContractEntrypoint) => [
              entrypoint.name,
              entrypoint
            ])
          )

          const storage = scriptResponse.code.find((primitiveApplication) => primitiveApplication.prim === 'storage')
          if (storage) {
            const normalizedStorage = this.normalizeContractCode(storage)
            this.storage = TezosContractStorage.fromJSON(normalizedStorage.args[0])
          }
        })
        .finally(() => {
          this.codePromise = undefined
        })
    }

    return this.codePromise
  }

  private normalizeContractCode(code: TezosContractCode): TezosContractCode {
    return {
      prim: code.prim,
      args: code.args?.map((arg) => MichelineNodeUtils.normalize(arg))
    }
  }

  private async getMetadataRemoteData(bigMapID: number): Promise<RemoteData<TezosContractMetadata> | undefined> {
    const uriEncoded = await this.bigMapValue(bigMapID, '', { prim: 'string' }, { prim: 'bytes' })
    const uri = uriEncoded ? (uriEncoded as MichelsonBytes).value.toString() : undefined

    return uri ? this.remoteDataFactory.create(uri.trim(), { contract: this }) : undefined
  }

  private async bigMapRequest(bigMapID: number, expr?: string): Promise<unknown | undefined> {
    const url = expr
      ? `${this.nodeRPCURL}/chains/main/blocks/head/context/big_maps/${bigMapID}/${expr}`
      : `${this.nodeRPCURL}/chains/main/blocks/head/context/big_maps/${bigMapID}`

    const response: AxiosResponse<string> = await axios.get(url)

    return response.data
  }

  private async contractRequest<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.nodeRPCURL}/chains/main/blocks/head/context/contracts/${this.address}/${trimStart(endpoint, '/')}`
    const response: AxiosResponse<T> =
      body === undefined
        ? await axios.get(url)
        : await axios.post(url, body, {
            headers: {
              'Content-Type': 'application/json'
            }
          })

    return response.data
  }

  private async conseilRequest<T>(endpoint: string, body: any): Promise<T> {
    const response: AxiosResponse<T> = await axios
      .post(`${this.conseilAPIURL}/v2/data/tezos/${this.conseilNetwork}/${trimStart(endpoint, '/')}`, body, {
        headers: {
          'Content-Type': 'application/json',
          apiKey: this.conseilAPIKey
        }
      })
      .catch((error) => {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      })

    return response.data
  }
}
