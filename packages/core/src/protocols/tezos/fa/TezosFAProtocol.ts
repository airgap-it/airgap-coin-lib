import axios, { AxiosError, AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosContract } from '../contract/TezosContract'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosProtocol } from '../TezosProtocol'
import { BigMapResponse } from '../types/contract/BigMapResult'
import { MichelineDataNode } from '../types/micheline/MichelineNode'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionOperation, TezosTransactionParameters, TezosWrappedTransactionOperation } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosTransactionCursor } from '../types/TezosTransactionCursor'
import { TezosTransactionResult } from '../types/TezosTransactionResult'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'
import { isMichelineNode } from '../types/utils'

import { TezosNetwork } from './../TezosProtocol'
import { TezosFAProtocolOptions } from './TezosFAProtocolOptions'
import { TezosAddress } from '../TezosAddress'
import { InvalidValueError, NetworkError, OperationFailedError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import { ConseilPredicate } from '../types/contract/ConseilPredicate'
import { TezosUtils } from '../TezosUtils'
import { TezosContractMetadata } from '../types/contract/TezosContractMetadata'
import { TezosFATokenMetadata } from '../types/fa/TezosFATokenMetadata'
import { hexToBytes } from '../../../utils/hex'
import { RemoteDataFactory } from '../../../utils/remote-data/RemoteDataFactory'
import { TezosContractRemoteDataFactory } from '../contract/remote-data/TezosContractRemoteDataFactory'
import { RemoteData } from '../../../utils/remote-data/RemoteData'

export interface TezosFAProtocolConfiguration {
  symbol: string
  name: string
  marketSymbol: string
  identifier: ProtocolSymbols
  contractAddress: string
  feeDefaults: FeeDefaults
  decimals?: number
  jsonRPCAPI?: string
  baseApiUrl?: string
  network?: TezosNetwork
  baseApiKey?: string
  baseApiNetwork?: string
}

const SYMBOL_GENERIC_FA = 'XTZ'
const NAME_GENERIC_FA = 'Generic FA'
const MARKET_SYMBOL_GENERIC_FA = 'xtz'
const DECIMALS_GENERIC_FA = NaN

export abstract class TezosFAProtocol extends TezosProtocol implements ICoinSubProtocol {
  public readonly isSubProtocol: boolean = true
  public readonly subProtocolType: SubProtocolType = SubProtocolType.TOKEN
  public readonly contractAddress: string
  public readonly tokenMetadataBigMapID?: number

  protected readonly contract: TezosContract

  protected readonly defaultSourceAddress: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'
  protected readonly remoteDataFactory: RemoteDataFactory = new TezosContractRemoteDataFactory()

  constructor(public readonly options: TezosFAProtocolOptions) {
    super()
    this.contractAddress = this.options.config.contractAddress
    this.identifier = this.options.config.identifier

    this.symbol = this.options.config.symbol ?? SYMBOL_GENERIC_FA
    this.name = this.options.config.name ?? NAME_GENERIC_FA
    this.marketSymbol = this.options.config.marketSymbol ?? MARKET_SYMBOL_GENERIC_FA
    this.decimals = this.options.config.decimals ?? DECIMALS_GENERIC_FA

    if (this.options.config.feeDefaults) {
      this.feeDefaults = this.options.config.feeDefaults
    }

    this.tokenMetadataBigMapID = options.config.tokenMetadataBigMapID

    this.contract = new TezosContract(
      this.options.config.contractAddress,
      this.options.network.extras.network,
      this.options.network.rpcUrl,
      this.options.network.extras.conseilUrl,
      this.options.network.extras.conseilNetwork,
      this.options.network.extras.conseilApiKey
    )
  }

  public abstract transactionDetailsFromParameters(parameters: TezosTransactionParameters): Partial<IAirGapTransaction>[]

  public async bigMapValue(key: string, isKeyHash: boolean = false, bigMapID?: number): Promise<string | null> {
    const result: BigMapResponse[] = await this.contract.conseilBigMapValues({
      bigMapID,
      predicates: [
        {
          field: isKeyHash ? 'key_hash' : 'key',
          operation: 'eq',
          set: [key]
        }
      ]
    })

    return result.length > 0 ? result[0].value : null
  }

  public async contractMetadata(): Promise<TezosContractMetadata | undefined> {
    return this.contract.metadata()
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const addresses: string[] = (await this.getAddressesFromPublicKey(publicKey)).map((address: TezosAddress) => address.getValue())

    return this.getTransactionsFromAddresses(addresses, limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const allTransactions = await Promise.all(
      addresses.map((address) => {
        const body = {
          predicates: [...this.getTransactionQueryPredicates(address, 'string'), ...this.getTransactionQueryPredicates(address, 'bytes')],
          orderBy: [
            {
              field: 'timestamp',
              direction: 'desc'
            }
          ],
          limit
        }
        if (cursor && cursor.lastBlockLevel) {
          body.predicates.push({
            field: 'block_level',
            operation: 'lt',
            set: [cursor.lastBlockLevel.toString()],
            inverse: false
          })
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
    const lastEntryBlockLevel: number = allTransactions.length > 0 ? allTransactions[allTransactions.length - 1].block_level : 0

    const transactions = allTransactions
      .reduce((current, next) => current.concat(next))
      .map((transaction: any) => this.transactionToAirGapTransactions(transaction, addresses))
      .reduce((flatten: IAirGapTransaction[], toFlatten: IAirGapTransaction[]) => flatten.concat(toFlatten), [])

    return {
      transactions,
      cursor: {
        lastBlockLevel: lastEntryBlockLevel
      }
    }
  }

  public getTransactionQueryPredicates(address: string, addressQueryType: 'string' | 'bytes'): ConseilPredicate[] {
    const addressQueryValue: string = addressQueryType === 'bytes' ? TezosUtils.encodeAddress(address).toString('hex') : address

    return [
      {
        field: 'parameters',
        operation: 'like',
        set: [addressQueryValue],
        inverse: false,
        group: addressQueryType
      },
      {
        field: 'parameters_entrypoints',
        operation: 'eq',
        set: ['transfer'],
        inverse: false,
        group: addressQueryType
      },
      {
        field: 'kind',
        operation: 'eq',
        set: ['transaction'],
        inverse: false,
        group: addressQueryType
      },
      {
        field: 'destination',
        operation: 'eq',
        set: [this.contractAddress],
        inverse: false,
        group: addressQueryType
      },
      ...this.getAdditionalTransactionQueryPredicates(address, addressQueryType).map((predicate) => {
        return {
          ...predicate,
          group: addressQueryType
        }
      })
    ]
  }

  protected getAdditionalTransactionQueryPredicates(address: string, addressQueryType: 'string' | 'bytes'): ConseilPredicate[] {
    return []
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

    const transactions: IAirGapTransaction[] = response.data
      .map((transaction: any) => this.transactionToAirGapTransactions(transaction))
      .reduce((flatten: IAirGapTransaction[], toFlatten: IAirGapTransaction[]) => flatten.concat(toFlatten), [])

    const lastEntryBlockLevel: number = response.data.length > 0 ? response.data[response.data.length - 1].block_level : 0

    return {
      transactions,
      cursor: {
        lastBlockLevel: lastEntryBlockLevel
      }
    }
  }

  public async normalizeTransactionParameters(parameters: string, fallbackEntrypointName?: string): Promise<TezosTransactionParameters> {
    const parsedParameters: unknown = this.parseParameters(parameters)

    if (!(parsedParameters instanceof Object && 'value' in parsedParameters) && !isMichelineNode(parsedParameters)) {
      throw new InvalidValueError(Domain.TEZOSFA, `Invalid parameters: ${JSON.stringify(parsedParameters)}`)
    }

    return this.contract.normalizeContractCallParameters(parsedParameters, fallbackEntrypointName)
  }

  public async getAllTokenMetadata(): Promise<Record<number, TezosFATokenMetadata> | undefined> {
    const tokenMetadataBigMapID = this.tokenMetadataBigMapID ?? (await this.contract.findBigMap('token_metadata'))
    if (tokenMetadataBigMapID === undefined) {
      return undefined
    }

    const value = await this.contract.bigMapValue(tokenMetadataBigMapID, {
      prim: 'list',
      args: [
        {
          prim: 'pair',
          args: [
            {
              prim: 'nat',
              annots: ['%token_id']
            },
            {
              prim: 'map',
              args: [{ prim: 'string' }, { prim: 'bytes' }],
              annots: ['%token_info']
            }
          ]
        }
      ]
    })
    const rawValue = value?.asRawValue()
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]
    const tokenMetadata = await Promise.all(
      values.map(async (value) => {
        const tokenID = value?.token_id?.toNumber()
        const tokenInfo = value?.token_info as Map<string, string>
        if (tokenID === undefined || tokenInfo === undefined) {
          return undefined
        }

        if (tokenInfo.has('')) {
          const uriEncoded = tokenInfo.get('')!
          const remoteData = this.createRemoteData(uriEncoded)
          const tokenMetdata = await remoteData?.get()
          if (this.isTokenMetadata(tokenMetdata)) {
            return [tokenID, tokenMetdata]
          }
        }

        const name = tokenInfo.get('name')
        const symbol = tokenInfo.get('symbol')
        const decimals = tokenInfo.get('decimals')

        if (!name || !symbol || !decimals) {
          return undefined
        }

        return [
          tokenID,
          {
            ...Array.from(tokenInfo.entries()).reduce((obj, next) => {
              const key = next[0]
              let value: string | number | boolean = typeof next[1] === 'string' ? hexToBytes(next[1]).toString() : next[1]
              if (value === 'true') {
                value = true
              } else if (value === 'false') {
                value = false
              } else if (!isNaN(parseInt(value))) {
                value = parseInt(value)
              }

              return Object.assign(obj, {
                [key]: value
              })
            }, {}),
            name: hexToBytes(name).toString(),
            symbol: hexToBytes(symbol).toString(),
            decimals: parseInt(hexToBytes(decimals).toString())
          }
        ]
      })
    )

    return tokenMetadata.reduce((obj, next) => (next ? Object.assign(obj, { [next[0]]: next[1] }) : obj), {})
  }

  protected async getTokenMetadataForTokenID(tokenID: number): Promise<TezosFATokenMetadata | undefined> {
    const tokenMetadata = await this.getAllTokenMetadata()
    return tokenMetadata ? tokenMetadata[tokenID] : undefined
  }

  private createRemoteData(uriEncoded: string): RemoteData<unknown> | undefined {
    // unless otherwise-specified, the encoding of the values must be the direct stream of bytes of the data being stored.
    let remoteData = this.remoteDataFactory.create(hexToBytes(uriEncoded).toString().trim(), { contract: this.contract })
    if (!remoteData && uriEncoded.startsWith('05')) {
      // however, sometimes the URI is a packed value
      remoteData = this.remoteDataFactory.create(TezosUtils.parseHex(uriEncoded).asRawValue(), { contract: this.contract })
    }

    return remoteData
  }

  protected async getTransactionOperationDetails(transactionOperation: TezosTransactionOperation): Promise<Partial<IAirGapTransaction>[]> {
    let partials: Partial<IAirGapTransaction>[] = []
    try {
      partials = transactionOperation.parameters ? this.transactionDetailsFromParameters(transactionOperation.parameters) ?? [] : []
    } catch {}

    if (partials.length === 0) {
      partials.push({})
    }

    return partials.map((partial: Partial<IAirGapTransaction>) => {
      return {
        from: [transactionOperation.source],
        amount: transactionOperation.amount,
        to: [transactionOperation.destination],
        ...partial
      }
    })
  }

  private parseParameters(parameters: string): unknown {
    const toBeRemoved = 'Unparsable code: '
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }

    return JSON.parse(parameters)
  }

  private transactionToAirGapTransactions(transaction: any, sourceAddresses?: string[]): IAirGapTransaction[] {
    const parameters: string = transaction.parameters_micheline ?? transaction.parameters
    const parsedParameters: unknown = this.parseParameters(parameters)

    if (!isMichelineNode(parsedParameters)) {
      throw new InvalidValueError(Domain.TEZOSFA, `Transaction parameters are invalid: ${JSON.stringify(parsedParameters)}`)
    }

    const transferData: TezosTransactionParameters = {
      entrypoint: transaction.parameters_entrypoints,
      value: parsedParameters
    }

    const partialDetails: Partial<IAirGapTransaction>[] = this.transactionDetailsFromParameters(transferData)

    return partialDetails.map((details: Partial<IAirGapTransaction>) => {
      const inbound: boolean =
        sourceAddresses !== undefined && details.to && details.to.length === 1 ? sourceAddresses.indexOf(details.to[0]) !== -1 : false

      return {
        amount: new BigNumber(0).toFixed(), // in tzbtc
        fee: new BigNumber(transaction.fee ?? 0).toFixed(), // in xtz
        from: [],
        isInbound: inbound,
        protocolIdentifier: this.identifier,
        network: this.options.network,
        to: [],
        hash: transaction.operation_group_hash,
        timestamp: transaction.timestamp / 1000,
        blockHeight: transaction.block_level,
        status: transaction.status,
        ...details
      }
    })
  }

  protected async runContractCall(contractCall: TezosContractCall, source: string): Promise<MichelineDataNode> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head/'))
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })
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
        throw new NetworkError(Domain.TEZOSFA, { response })
      }
    } catch (runOperationError) {
      throw new NetworkError(Domain.TEZOSFA, runOperationError as AxiosError)
    }
  }

  protected async prepareContractCall(contractCalls: TezosContractCall[], fee: string, publicKey: string): Promise<RawTezosTransaction> {
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
      throw new OperationFailedError(Domain.TEZOSFA, 'Forging Tezos TX failed.')
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
  ): { chain_id: string; operation: TezosWrappedTransactionOperation } {
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

  private isTokenMetadata(obj: unknown): obj is TezosFATokenMetadata {
    return typeof obj === 'object' && obj !== null && 'symbol' in obj && 'name' in obj && 'decimals' in obj
  }
}
