import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosContract } from '../contract/TezosContract'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork, TezosProtocol } from '../TezosProtocol'
import { MichelineDataNode } from '../types/micheline/MichelineNode'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionParameters, TezosWrappedTransactionOperation } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'
import { isMichelineNode } from '../types/utils'

import { FeeDefaults } from './../../ICoinProtocol'

export interface TezosFAProtocolConfiguration {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string

  contractAddress: string

  feeDefaults: FeeDefaults
  decimals?: number

  jsonRPCAPI?: string

  network?: TezosNetwork

  baseApiUrl?: string
  baseApiKey?: string
  baseApiNetwork?: string
}

export interface TezosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: TezosTransactionCursor
}

export interface TezosTransactionCursor {
  lastBlockLevel: number
}

export abstract class TezosFAProtocol extends TezosProtocol implements ICoinSubProtocol {
  public readonly isSubProtocol: boolean = true
  public readonly subProtocolType: SubProtocolType = SubProtocolType.TOKEN
  public readonly identifier: string
  public readonly contractAddress: string

  protected readonly contract: TezosContract

  protected readonly defaultSourceAddress: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'

  constructor(configuration: TezosFAProtocolConfiguration) {
    super(configuration.jsonRPCAPI, configuration.baseApiUrl, configuration.network, configuration.baseApiNetwork, configuration.baseApiKey)
    this.contractAddress = configuration.contractAddress
    this.symbol = configuration.symbol
    this.name = configuration.name
    this.marketSymbol = configuration.marketSymbol
    this.identifier = configuration.identifier
    this.feeDefaults = configuration.feeDefaults
    this.decimals = configuration.decimals || this.decimals
    
    this.contract = new TezosContract({
      address: this.contractAddress,
      nodeRPCURL: this.jsonRPCAPI,
      conseilAPIURL: this.baseApiUrl,
      conseilNetwork: this.baseApiNetwork,
      conseilAPIKey: this.headers.apiKey
    })
  }

  public abstract async transactionDetailsFromParameters(parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]>

  public async bigMapValue(key: string, isKeyHash: boolean = false): Promise<string | null> {
    return this.contract.bigMapValue(key, isKeyHash)
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

    return this.getTransactionsFromAddresses(addresses, limit, offset)
  }

  public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    // TODO: implement pagination
    if (offset !== 0) {
      return []
    }

    const allTransactions = await Promise.all(
      addresses.map((address) => {
        const body = {
          predicates: [
            {
              field: 'parameters',
              operation: 'like',
              set: [address],
              inverse: false
            },
            {
              field: 'parameters_entrypoints',
              operation: 'eq',
              set: ['transfer'],
              inverse: false
            },
            {
              field: 'kind',
              operation: 'eq',
              set: ['transaction'],
              inverse: false
            },
            {
              field: 'destination',
              operation: 'eq',
              set: [this.contractAddress],
              inverse: false
            }
          ],
          orderBy: [
            {
              field: 'timestamp',
              direction: 'desc'
            }
          ],
          limit
        }

        return axios
          .post(`${this.baseApiUrl}/v2/data/tezos/${this.baseApiNetwork}/operations`, body, {
            // incoming txs
            headers: this.headers
          })
          .then((response) => response.data)
          .catch(() => {
            return []
          })
      })
    )

    return Promise.all<IAirGapTransaction[]>(allTransactions
      .reduce((current, next) => current.concat(next))
      .map((transaction: any) => {
        return this.transactionToAirGapTransactions(transaction, addresses)
      })
    ).then((transactions: IAirGapTransaction[][]) => {
      return transactions.reduce((flatten: IAirGapTransaction[], toFlatten: IAirGapTransaction[]) => flatten.concat(toFlatten), [])
    })
  }

  public async getTransactions(limit: number, cursor?: TezosTransactionCursor): Promise<TezosTransactionResult> {
    const body = {
      predicates: [
        {
          field: 'parameters',
          operation: 'like',
          set: ['"transfer"'] as any[],
          inverse: false
        },
        {
          field: 'kind',
          operation: 'eq',
          set: ['transaction'],
          inverse: false
        },
        {
          field: 'destination',
          operation: 'eq',
          set: [this.contractAddress],
          inverse: false
        }
      ],
      orderBy: [
        {
          field: 'block_level',
          direction: 'desc'
        }
      ],
      limit
    }
    if (cursor !== undefined) {
      body.predicates.push({
        field: 'block_level',
        operation: 'lt',
        set: [cursor.lastBlockLevel],
        inverse: false
      })
    }
    const response = await axios.post(`${this.baseApiUrl}/v2/data/tezos/${this.baseApiNetwork}/operations`, body, {
      headers: this.headers
    })
    const transactions: IAirGapTransaction[] = await Promise.all<IAirGapTransaction[]>(response.data.map((transaction: any) => {
      return this.transactionToAirGapTransactions(transaction)
    })).then((transactions: IAirGapTransaction[][]) => {
      return transactions.reduce((flatten: IAirGapTransaction[], toFlatten: IAirGapTransaction[]) => flatten.concat(toFlatten), [])
    })
    const lastEntryBlockLevel: number = response.data.length > 0 ? response.data[response.data.length - 1].block_level : 0

    return {
      transactions,
      cursor: {
        lastBlockLevel: lastEntryBlockLevel
      }
    }
  }

  public async normalizeTransactionParameters(
    parameters: string,
    fallbackEntrypointName?: string
  ): Promise<TezosTransactionParameters> {
    const parsedParameters: unknown = this.parseParameters(parameters)
    if (!(parsedParameters instanceof Object && 'value' in parsedParameters) || !isMichelineNode(parsedParameters)) {
      throw new Error('Invalid parameters.')
    }

    return this.contract.normalizeContractCallParameters(parsedParameters, fallbackEntrypointName)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    // there is no standard way to fetch token holders for now, every subclass needs to implement its own logic
    return []
  }

  private parseParameters(parameters: string): unknown {
    const toBeRemoved = 'Unparsable code: '
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }

    return JSON.parse(parameters)
  }

  private async transactionToAirGapTransactions(transaction: any, sourceAddresses?: string[]): Promise<IAirGapTransaction[]> {
    const parameters: string = transaction.parameters_micheline ?? transaction.parameters
    const parsedParameters: unknown = this.parseParameters(parameters)

    if (!isMichelineNode(parsedParameters)) {
      throw new Error('Transaction parameters are invalid.')
    }

    const transferData: TezosTransactionParameters = {
      entrypoint: transaction.parameters_entrypoints,
      value: parsedParameters
    }

    const partialDetails: Partial<IAirGapTransaction>[] = await this.transactionDetailsFromParameters(transferData)

    return partialDetails.map((details: Partial<IAirGapTransaction>) => {
      const inbound: boolean = sourceAddresses !== undefined && details.to && details.to.length === 1
      ? sourceAddresses.indexOf(details.to[0]) !== -1 
      : false

      return {
        amount: new BigNumber(0).toFixed(), // in tzbtc
        fee: new BigNumber(transaction.fee ?? 0).toFixed(), // in xtz
        from: [],
        isInbound: inbound,
        protocolIdentifier: this.identifier,
        to: [],
        hash: transaction.operation_group_hash,
        timestamp: transaction.timestamp / 1000,
        blockHeight: transaction.block_level,
        extra: {
          status: transaction.status
        },
        ...details
      }
    })
  }

  protected async runContractCall(contractCall: TezosContractCall, source: string): Promise<MichelineDataNode> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head/'))
    ])
    const counter = new BigNumber(results[0].data).plus(1)
    const branch = results[1].data.hash
    const chainID = results[1].data.chain_id
    const body = this.prepareMockContractCall(contractCall, chainID, branch, counter, source, this.contractAddress)
    try {
      const response = await axios.post(this.url('/chains/main/blocks/head/helpers/scripts/run_operation'), body, {
        headers: { 'Content-Type': 'application/json' }
      })
      const metadata = response.data.contents[0].metadata
      if (metadata.internal_operation_results !== undefined && metadata.operation_result.status === 'applied') {
        return metadata.internal_operation_results[0].parameters.value 
      } else {
        throw new Error(metadata.operation_result.errors[0].id)
      }
    } catch (runOperationError) {
      console.error(runOperationError)
      throw runOperationError
    }
  }

  protected async prepareContractCall(
    contractCalls: TezosContractCall[], 
    fee: string, 
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const operations: TezosOperation[] = contractCalls.map((contractCall: TezosContractCall) => {
      return {
        kind: TezosOperationType.TRANSACTION,
        fee,
        amount: '0',
        destination: this.contractAddress,
        parameters: contractCall.toJSON()
      }
    })

    try {
      const tezosWrappedOperation: TezosWrappedOperation = await this.prepareOperations(publicKey, operations, false)
      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.error(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }
  
  protected requireSource(source?: string, defaultSource?: string, ...excludedPrefixes: string[]): string {
    const _source = source ?? defaultSource

    return _source === undefined || excludedPrefixes.some((excluded: string) => _source.toLowerCase().startsWith(excluded.toLowerCase()))
      ? this.defaultSourceAddress
      : _source
  }

  private prepareMockContractCall(
    contractCall: TezosContractCall,
    chainID: string,
    branch: string,
    counter: BigNumber,
    source: string,
    contractAddress: string,
    fee: string = '0'
  ): { chain_id: string, operation: TezosWrappedTransactionOperation } {
    return {
      chain_id: chainID,
      operation: {
        branch,
        signature: 'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP', // signature will not be checked, so it is ok to always use this one
        contents: [
          {
            kind: TezosOperationType.TRANSACTION,
            counter: counter.toFixed(),
            amount: '0',
            source,
            destination: contractAddress,
            fee,
            gas_limit: '400000',
            storage_limit: '60000',
            parameters: contractCall.toJSON()
          }
        ]
      }
    }
  }

  private url(path: string): string {
    return `${this.jsonRPCAPI}${path}`
  }
}
