import { FeeDefaults, ICoinSubProtocol, SubProtocolType } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError, NetworkError, OperationFailedError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { RemoteDataFactory } from '@airgap/coinlib-core/utils/remote-data/RemoteDataFactory'

import { RawTezosTransaction } from '../../types/transaction-tezos'
import { TezosContractRemoteDataFactory } from '../contract/remote-data/TezosContractRemoteDataFactory'
import { TezosContract } from '../contract/TezosContract'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosProtocol } from '../TezosProtocol'
import { TezosProtocolNetworkResolver } from '../TezosProtocolOptions'
import { TezosContractMetadata } from '../types/contract/TezosContractMetadata'
import { TezosFATokenMetadata } from '../types/fa/TezosFATokenMetadata'
import { MichelineDataNode, MichelineNode } from '../types/micheline/MichelineNode'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionOperation, TezosTransactionParameters, TezosWrappedTransactionOperation } from '../types/operations/Transaction'
import { TezosAddressResult } from '../types/TezosAddressResult'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosTransactionCursor } from '../types/TezosTransactionCursor'
import { TezosTransactionResult } from '../types/TezosTransactionResult'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'
import { isMichelineNode } from '../types/utils'

import { TezosNetwork } from './../TezosProtocol'
import { BigMapTokenMetadataIndexer } from './metadata/BigMapTokenMetadataIndexer'
import { ObjktTokenMetadataIndexer } from './metadata/ObjktTokenMetadataIndexer'
import { TezosFAProtocolOptions } from './TezosFAProtocolOptions'

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

  public readonly contract: TezosContract

  public readonly defaultSourceAddress: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'
  public readonly remoteDataFactory: RemoteDataFactory = new TezosContractRemoteDataFactory()

  private readonly objktTokenMetadataIndexer: ObjktTokenMetadataIndexer
  private readonly bigMapTokenMetadataIndexer: BigMapTokenMetadataIndexer

  constructor(public readonly options: TezosFAProtocolOptions) {
    super(options)
    this.contractAddress = this.options.config.contractAddress
    this.identifier = this.options.config.identifier

    this.symbol = this.options.config.symbol ?? SYMBOL_GENERIC_FA
    this.name = this.options.config.name ?? NAME_GENERIC_FA
    this.marketSymbol = this.options.config.marketSymbol ?? MARKET_SYMBOL_GENERIC_FA
    this.decimals = this.options.config.decimals ?? DECIMALS_GENERIC_FA

    if (this.options.config.feeDefaults) {
      this.feeDefaults = this.options.config.feeDefaults
    }

    this.contract = new TezosContract(this.options.config.contractAddress, this.options.network)

    this.tokenMetadataBigMapID = options.config.tokenMetadataBigMapID
    this.objktTokenMetadataIndexer = new ObjktTokenMetadataIndexer(this.contractAddress)
    this.bigMapTokenMetadataIndexer = new BigMapTokenMetadataIndexer(this.contract, this.tokenMetadataBigMapID)
  }

  public async getIsSubProtocol(): Promise<boolean> {
    return this.isSubProtocol
  }

  public async getSubProtocolType(): Promise<SubProtocolType> {
    return this.subProtocolType
  }

  public async getContractAddress(): Promise<string | undefined> {
    return this.contractAddress
  }

  public async getOptions(): Promise<TezosFAProtocolOptions> {
    return this.options
  }

  public abstract transactionDetailsFromParameters(parameters: TezosTransactionParameters): Partial<IAirGapTransaction>[]

  public async bigMapValue(key: string, isKeyHash: boolean = false, bigMapID?: number): Promise<MichelineNode | null> {
    const bigMaps = await this.contract.getBigMaps()
    const bigMap = bigMapID !== undefined ? bigMaps.find((bigMap) => bigMap.id === bigMapID) : bigMaps[0]
    if (!bigMap) {
      return null
    }
    const result = await this.contract.getBigMapValue({
      bigMap,
      key,
      resultType: 'micheline'
    })

    return result !== undefined ? result.value : null
  }

  public async contractMetadata(networkResolver?: TezosProtocolNetworkResolver): Promise<TezosContractMetadata | undefined> {
    return this.contract.metadata(networkResolver)
  }

  public async estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    recipients: string[],
    fee?: string,
    data?: any
  ): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey, data)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const addresses: string[] = (await this.getAddressesFromPublicKey(publicKey)).map((address: TezosAddressResult) => address.address)

    return this.getTransactionsFromAddresses(addresses, limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const transactions = await this.contract.network.extras.indexerClient.getTokenTransactionsForAddress(
      { contractAddress: this.contract.address, id: 0 },
      addresses[0],
      limit,
      cursor?.offset
    )
    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        protocolIdentifier: this.identifier,
        network: this.options.network
      })),
      cursor: {
        offset: (cursor?.offset ?? 0) + transactions.length
      }
    }
  }

  public async getTransactions(limit: number, cursor?: TezosTransactionCursor): Promise<TezosTransactionResult> {
    const transactions = await this.contract.network.extras.indexerClient.getTokenTransactions(
      { contractAddress: this.contract.address, id: 0 },
      limit,
      cursor?.offset
    )
    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        protocolIdentifier: this.identifier,
        network: this.options.network
      })),
      cursor: {
        offset: (cursor?.offset ?? 0) + transactions.length
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
    const objktMetadata: Record<number, Partial<TezosFATokenMetadata>> | undefined = await this.objktTokenMetadataIndexer.getTokenMetadata()
    const missingTokenIDs: Set<number> | undefined =
      objktMetadata !== undefined
        ? new Set(
            Object.entries(objktMetadata)
              .filter(([_, metadata]) => !metadata.symbol && !metadata.name && !metadata.decimals)
              .map(([tokenID, _]) => parseInt(tokenID, 10))
          )
        : undefined

    const bigMapMetadata: Record<number, Partial<TezosFATokenMetadata>> | undefined =
      missingTokenIDs === undefined || missingTokenIDs.size > 0
        ? await this.bigMapTokenMetadataIndexer.getTokenMetadata(missingTokenIDs ? Array.from(missingTokenIDs) : undefined)
        : undefined

    if (objktMetadata === undefined && bigMapMetadata === undefined) {
      return undefined
    }

    return Object.entries(objktMetadata ?? {})
      .filter(([tokenID, _]) => !(missingTokenIDs?.has(parseInt(tokenID, 10)) ?? false))
      .concat(Object.entries(bigMapMetadata ?? {}))
      .reduce((obj: Record<number, TezosFATokenMetadata>, [tokenID, metadata]: [string, Partial<TezosFATokenMetadata>]) => {
        return Object.assign(obj, {
          [parseInt(tokenID, 10)]: {
            symbol: metadata.symbol ?? '',
            name: metadata.name ?? '',
            decimals: metadata.decimals ?? 0
          }
        })
      }, {})
  }

  protected async getTokenMetadataForTokenID(tokenID: number): Promise<TezosFATokenMetadata | undefined> {
    const tokenMetadata = await this.getAllTokenMetadata()
    return tokenMetadata ? tokenMetadata[tokenID] : undefined
  }

  protected async getTransactionOperationDetails(transactionOperation: TezosTransactionOperation): Promise<Partial<IAirGapTransaction>[]> {
    let partials: Partial<IAirGapTransaction>[] = []
    try {
      partials = transactionOperation.parameters ? (this.transactionDetailsFromParameters(transactionOperation.parameters) ?? []) : []
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

  protected async runContractCall(contractCall: TezosContractCall, source: string): Promise<MichelineDataNode> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head/header'))
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
    const operations: TezosOperation[] = await Promise.all(
      contractCalls.map(async (contractCall: TezosContractCall) => {
        return {
          kind: TezosOperationType.TRANSACTION,
          fee,
          amount: '0',
          destination: this.contractAddress,
          parameters: contractCall.toJSON()
        }
      })
    )

    try {
      const tezosWrappedOperation: TezosWrappedOperation = await this.prepareOperations(publicKey, operations, false)
      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error: any) {
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
}
