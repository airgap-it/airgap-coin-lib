import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError, NetworkError, OperationFailedError } from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { TezosContract } from '../../contract/TezosContract'
import { TezosContractCall } from '../../contract/TezosContractCall'
import { createTezosIndexerClient } from '../../indexer/factory'
import { TezosIndexerClient } from '../../indexer/TezosIndexerClient'
import { BigMapTokenMetadataIndexerClient } from '../../indexer/token-metadata/BigMapTokenMetadataIndexerClient'
import { ObjktTokenMetadataIndexerClient } from '../../indexer/token-metadata/ObjktTokenMetadataIndexerClient'
import { BigMap } from '../../types/contract/bigmap/BigMap'
import { BigMapEntry } from '../../types/contract/bigmap/BigMapEntry'
import { TezosContractMetadata } from '../../types/contract/TezosContractMetadata'
import { TezosCryptoConfiguration } from '../../types/crypto'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { MichelineDataNode, MichelineNode } from '../../types/micheline/MichelineNode'
import { TezosOperation } from '../../types/operations/kinds/TezosOperation'
import { TezosTransactionParameters, TezosWrappedTransactionOperation } from '../../types/operations/kinds/Transaction'
import { TezosOperationType } from '../../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../../types/operations/TezosWrappedOperation'
import { TezosFAProtocolNetwork, TezosFAProtocolOptions, TezosProtocolNetworkResolver, TezosUnits } from '../../types/protocol'
import { TezosSignedTransaction, TezosTransactionCursor, TezosUnsignedTransaction } from '../../types/transaction'
import { isMichelineNode } from '../../utils/micheline'
import { TezosFAAccountant } from '../../utils/protocol/fa/TezosFAAccountant'
import { TEZOS_ACCOUNT_METADATA, TEZOS_MAINNET_PROTOCOL_NETWORK, TEZOS_UNITS, TezosProtocol, TezosProtocolImpl } from '../TezosProtocol'

// Interface

export interface TezosFAProtocol<_Units extends string = string, _ProtocolNetwork extends TezosFAProtocolNetwork = TezosFAProtocolNetwork>
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: _ProtocolNetwork
      CryptoConfiguration: TezosCryptoConfiguration
      Units: _Units
      FeeUnits: TezosUnits
      FeeEstimation: FeeDefaults<TezosUnits>
      UnsignedTransaction: TezosUnsignedTransaction
      SignedTransaction: TezosSignedTransaction
      TransactionCursor: TezosTransactionCursor
    },
    'SingleTokenSubProtocol',
    'Crypto',
    'FetchDataForAddress'
  > {
  isTezosFAProtocol: true

  contractMetadata(networkResolver?: TezosProtocolNetworkResolver): Promise<TezosContractMetadata | undefined>
  getAllTokenMetadata(): Promise<Record<number, TezosFATokenMetadata> | undefined>

  bigMapValue(key: string, isKeyHash?: boolean, bigMapId?: number): Promise<MichelineNode | undefined>

  normalizeTransactionParameters(parameters: string, fallbackEntrypointName?: string): Promise<TezosTransactionParameters>

  getTransactions(
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>>
}

// Implementation

export abstract class TezosFAProtocolImpl<
  _Entrypoints extends string,
  _Units extends string,
  _ProtocolNetwork extends TezosFAProtocolNetwork
> implements TezosFAProtocol<_Units, _ProtocolNetwork>
{
  public readonly isTezosFAProtocol: true = true

  protected readonly options: TezosFAProtocolOptions<_Units, _ProtocolNetwork>

  protected readonly tezos: TezosProtocol
  protected readonly accountant: TezosFAAccountant<_Units>

  protected readonly indexer: TezosIndexerClient

  protected readonly contract: TezosContract<_Entrypoints>

  private readonly objktTokenMetadataIndexerClient: ObjktTokenMetadataIndexerClient
  private readonly bigMapTokenMetadataIndexerClient: BigMapTokenMetadataIndexerClient

  protected constructor(options: TezosFAProtocolOptions<_Units, _ProtocolNetwork>, accountant: TezosFAAccountant<_Units>) {
    this.options = options

    this.tezos = new TezosProtocolImpl({ network: options.network })
    this.accountant = accountant
    this.indexer = createTezosIndexerClient(options.network.indexerType, options.network.indexerApi)

    this.contract = new TezosContract(options.network.contractAddress, options.network)

    this.objktTokenMetadataIndexerClient = new ObjktTokenMetadataIndexerClient(
      this.options.network.contractAddress,
      this.options.network.objktApiUrl
    )
    this.bigMapTokenMetadataIndexerClient = new BigMapTokenMetadataIndexerClient(this.contract, this.options.network.tokenMetadataBigMapId)

    this.metadata = {
      identifier: options.identifier,
      name: options.name,

      units: options.units,
      mainUnit: options.mainUnit,

      fee: {
        defaults: options.feeDefaults,
        units: TEZOS_UNITS,
        mainUnit: 'tez'
      },

      account: TEZOS_ACCOUNT_METADATA
    }
  }

  // SubProtocol

  public async getType(): Promise<'token'> {
    return 'token'
  }

  public async mainProtocol(): Promise<string> {
    return MainProtocolSymbols.XTZ
  }

  public async getContractAddress(): Promise<string> {
    return this.options.network.contractAddress
  }

  // Common

  protected readonly metadata: ProtocolMetadata<_Units, TezosUnits>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, TezosUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return this.tezos.getAddressFromPublicKey(publicKey)
  }

  public async getDetailsFromTransaction(
    transaction: TezosUnsignedTransaction | TezosSignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    return this.accountant.getDetailsFromTransaction(transaction)
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    return this.tezos.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    return this.tezos.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  // Offline

  public async getCryptoConfiguration(): Promise<TezosCryptoConfiguration> {
    return this.tezos.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.tezos.getKeyPairFromDerivative(derivative)
  }

  public async signTransactionWithSecretKey(transaction: TezosUnsignedTransaction, secretKey: SecretKey): Promise<TezosSignedTransaction> {
    return this.tezos.signTransactionWithSecretKey(transaction, secretKey)
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    return this.tezos.signMessageWithKeyPair(message, keyPair)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    return this.tezos.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    return this.tezos.encryptAESWithSecretKey(payload, secretKey)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    return this.tezos.decryptAESWithSecretKey(payload, secretKey)
  }

  // Online

  public async getNetwork(): Promise<_ProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>> {
    const transactions: Omit<AirGapTransaction<never, TezosUnits>, 'network'>[] = await this.indexer.getTokenTransactionsForAddress(
      { contractAddress: this.contract.address, id: 0 },
      address,
      limit,
      cursor?.offset
    )

    return {
      transactions: transactions.map((transaction: Omit<AirGapTransaction<never, TezosUnits>, 'network'>) => ({
        ...transaction,
        network: this.options.network
      })),
      cursor: {
        hasNext: transactions.length >= limit,
        offset: (cursor?.offset ?? 0) + transactions.length
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<_Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public abstract getBalanceOfAddress(address: string): Promise<Balance<_Units>>

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    _to: string[],
    _configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<Amount<_Units>> {
    const balance: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)

    return balance.transferable ?? balance.total
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<TezosUnits>> {
    const transferCalls: TezosContractCall[] = await this.createTransferCalls(publicKey, details, configuration)
    const operations: TezosOperation[] = transferCalls.map((transferCall: TezosContractCall) => {
      return {
        kind: TezosOperationType.TRANSACTION,
        amount: '0',
        destination: this.options.network.contractAddress,
        parameters: transferCall.toJSON(),
        fee: '0'
      }
    })

    return this.tezos.getOperationFeeDefaults(publicKey, operations)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction> {
    let fee: Amount<TezosUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<TezosUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const transferCalls: TezosContractCall[] = await this.createTransferCalls(publicKey, details, configuration)

    return this.prepareContractCall(transferCalls, fee, publicKey)
  }

  public async broadcastTransaction(transaction: TezosSignedTransaction): Promise<string> {
    return this.tezos.broadcastTransaction(transaction)
  }

  // Custom

  public async contractMetadata(networkResolver?: TezosProtocolNetworkResolver): Promise<TezosContractMetadata | undefined> {
    return this.contract.metadata(networkResolver)
  }

  public async getAllTokenMetadata(): Promise<Record<number, TezosFATokenMetadata> | undefined> {
    const objktMetadata: Record<number, Partial<TezosFATokenMetadata>> | undefined =
      await this.objktTokenMetadataIndexerClient.getTokenMetadata()
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
        ? await this.bigMapTokenMetadataIndexerClient.getTokenMetadata(missingTokenIDs ? Array.from(missingTokenIDs) : undefined)
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

  protected async getTokenMetadataForTokenId(tokenId: number): Promise<TezosFATokenMetadata | undefined> {
    const tokenMetadata: Record<number, TezosFATokenMetadata> | undefined = await this.getAllTokenMetadata()

    return tokenMetadata ? tokenMetadata[tokenId] : undefined
  }

  public async bigMapValue(key: string, isKeyHash: boolean = false, bigMapId?: number): Promise<MichelineNode | undefined> {
    const bigMaps: BigMap[] = await this.contract.getBigMaps()
    const bigMap: BigMap | undefined = bigMapId !== undefined ? bigMaps.find((bigMap: BigMap) => bigMap.id === bigMapId) : bigMaps[0]
    if (!bigMap) {
      return undefined
    }
    const result: BigMapEntry<'micheline'> | undefined = await this.contract.getBigMapValue({
      bigMap,
      key,
      resultType: 'micheline'
    })

    return result?.value
  }

  public async normalizeTransactionParameters(parameters: string, fallbackEntrypointName?: string): Promise<TezosTransactionParameters> {
    const parsedParameters: unknown = this.parseParameters(parameters)

    if (!(parsedParameters instanceof Object && 'value' in parsedParameters) && !isMichelineNode(parsedParameters)) {
      throw new InvalidValueError(Domain.TEZOSFA, `Invalid parameters: ${JSON.stringify(parsedParameters)}`)
    }

    return this.contract.normalizeContractCallParameters(parsedParameters, fallbackEntrypointName)
  }

  private parseParameters(parameters: string): unknown {
    const toBeRemoved: string = 'Unparsable code: '
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }

    return JSON.parse(parameters)
  }

  public async getTransactions(
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>> {
    const transactions: Omit<AirGapTransaction<never, TezosUnits>, 'network'>[] = await this.indexer.getTokenTransactions(
      { contractAddress: this.contract.address, id: 0 },
      limit,
      cursor?.offset
    )

    return {
      transactions: transactions.map((transaction: Omit<AirGapTransaction<never, TezosUnits>, 'network'>) => ({
        ...transaction,
        network: this.options.network
      })),
      cursor: {
        hasNext: transactions.length >= limit,
        offset: (cursor?.offset ?? 0) + transactions.length
      }
    }
  }

  protected abstract createTransferCalls(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosContractCall[]>

  protected async prepareContractCall(
    contractCalls: TezosContractCall[],
    fee: Amount<TezosUnits>,
    publicKey: PublicKey
  ): Promise<TezosUnsignedTransaction> {
    const tezosMetadata: ProtocolMetadata<TezosUnits> = await this.tezos.getMetadata()
    const operations: TezosOperation[] = await Promise.all(
      contractCalls.map(async (contractCall: TezosContractCall) => {
        return {
          kind: TezosOperationType.TRANSACTION,
          fee: newAmount(fee).blockchain(tezosMetadata.units).value,
          amount: '0',
          destination: this.options.network.contractAddress,
          parameters: contractCall.toJSON()
        }
      })
    )

    try {
      const tezosWrappedOperation: TezosWrappedOperation = await this.tezos.prepareOperations(publicKey, operations, false)
      const binaryTx: string = await this.tezos.forgeOperation(tezosWrappedOperation)

      return newUnsignedTransaction<TezosUnsignedTransaction>({ binary: binaryTx })
    } catch (error: any) {
      console.error(error.message)
      throw new OperationFailedError(Domain.TEZOSFA, 'Forging Tezos TX failed.')
    }
  }

  protected async runContractCall(contractCall: TezosContractCall, source: string): Promise<MichelineDataNode> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head/header'))
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })
    const counter: BigNumber = new BigNumber(results[0].data).plus(1)
    const branch: string = results[1].data.hash
    const chainId: string = results[1].data.chain_id
    const body = this.prepareMockContractCall(contractCall, chainId, branch, counter, source, this.options.network.contractAddress)
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

  protected requireSource(source?: string, defaultSource?: string, ...excludedPrefixes: string[]): string {
    const _source: string | undefined = source ?? defaultSource

    return _source === undefined || excludedPrefixes.some((excluded: string) => _source.toLowerCase().startsWith(excluded.toLowerCase()))
      ? this.options.network.defaultSourceAddress
      : _source
  }

  private prepareMockContractCall(
    contractCall: TezosContractCall,
    chainId: string,
    branch: string,
    counter: BigNumber,
    source: string,
    contractAddress: string,
    fee: string = '0'
  ): { chain_id: string; operation: TezosWrappedTransactionOperation } {
    return {
      chain_id: chainId,
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
    return `${this.options.network.rpcUrl}${path}`
  }
}

// Factory

export const TEZOS_FA_MAINNET_PROTOCOL_NETWORK: Omit<TezosFAProtocolNetwork, 'contractAddress'> = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  defaultSourceAddress: 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT',
  objktApiUrl: 'https://data.objkt.com/v3/graphql'
}

export function createTezosFAProtocolOptions<_Units extends string, _ProtocolNetwork extends TezosFAProtocolNetwork>(
  network: _ProtocolNetwork,
  identifier: TezosFAProtocolOptions<_Units, _ProtocolNetwork>['identifier'],
  name?: TezosFAProtocolOptions<_Units, _ProtocolNetwork>['name'],
  units?: TezosFAProtocolOptions<_Units, _ProtocolNetwork>['units'],
  mainUnit?: TezosFAProtocolOptions<_Units, _ProtocolNetwork>['mainUnit'],
  feeDefaults?: TezosFAProtocolOptions<_Units, _ProtocolNetwork>['feeDefaults']
): TezosFAProtocolOptions<_Units, _ProtocolNetwork> {
  return {
    network,
    identifier,
    name: name ?? 'Generic FA2',
    units:
      units ??
      ({
        tez: TEZOS_UNITS.tez
      } as TezosFAProtocolOptions<_Units, _ProtocolNetwork>['units']),
    mainUnit: mainUnit ?? ('tez' as TezosFAProtocolOptions<_Units, _ProtocolNetwork>['mainUnit']),
    feeDefaults
  }
}
