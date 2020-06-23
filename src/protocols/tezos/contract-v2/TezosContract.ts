import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'

import { TezosContractEntrypoint } from './TezosContractEntrypoint'
import { MichelineTypeNode, MichelinePrimitiveApplication } from './micheline/MichelineNode'
import { TezosContractCall } from './TezosContractCall'
import { MichelsonTypeMapping } from './michelson/MichelsonTypeMapping'

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

  private readonly address: string
  private readonly nodeRPCURL: string
  // TODO: set private when used
  public readonly conseilAPIURL: string
  public readonly conseilNetwork: string
  public readonly conseilAPIKey: string

  private readonly parseDefaultEntrypoint: boolean

  constructor(configuration: TezosContractConfiguration) {
    this.address = configuration.address
    this.nodeRPCURL = configuration.nodeRPCURL
    this.conseilAPIURL = configuration.conseilAPIURL
    this.conseilNetwork = configuration.conseilNetwork
    this.conseilAPIKey = configuration.conseilAPIKey

    this.parseDefaultEntrypoint = configuration.parseDefaultEntrypoint !== undefined ? configuration.parseDefaultEntrypoint : true
  }

  public async createContractCall(entrypointName: string, ...args: unknown[]): Promise<TezosContractCall> {
    await this.waitForEntrypoints()

    const entrypoint: TezosContractEntrypoint | undefined = this.entrypoints?.get(entrypointName)
    if (!entrypoint) {
      return this.createDefaultContractCall(args)
    }

    return this.createEntrypointContractCall(entrypoint || TezosContract.DEFAULT_ENTRYPOINT, args)
  }

  private createDefaultContractCall(args: unknown[]): TezosContractCall {
    return {
      entrypoint: TezosContract.DEFAULT_ENTRYPOINT,
      value: args instanceof MichelsonTypeMapping ? args.toMichelineJSON() : {}
    }
  }

  private createEntrypointContractCall(entrypoint: TezosContractEntrypoint, args: unknown[]): TezosContractCall {
    return {
      entrypoint: entrypoint.name,
      value: entrypoint.type.createValue(...args).toMichelineJSON()
    }
  }

  private async waitForEntrypoints(): Promise<void> {
    if (this.entrypoints !== undefined) {
      return
    }

    if (this.entrypointsPromise !== undefined) {
      return this.entrypointsPromise
    }

    const codePromise: Promise<Record<'code', TezosContractCode[]>> = this.getFromNode('script')
    const entrypointsPromise: Promise<Record<'entrypoints', Record<string, MichelineTypeNode>>> = this.getFromNode('entrypoints')

    const [codeResponse, entrypointsResponse] = await Promise.all([
      this.parseDefaultEntrypoint ? codePromise : undefined, 
      entrypointsPromise
    ])

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
  }

  private async getFromNode<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await axios.get(
      `${this.nodeRPCURL}/chains/main/blocks/head/context/contracts/${this.address}/${endpoint}`
    )

    return response.data
  }
}