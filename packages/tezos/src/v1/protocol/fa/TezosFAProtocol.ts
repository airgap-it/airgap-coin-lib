import { Domain } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError, NetworkError, OperationFailedError } from '@airgap/coinlib-core/errors'
import { hexToBytes, isHex } from '@airgap/coinlib-core/utils/hex'
import { RemoteData } from '@airgap/coinlib-core/utils/remote-data/RemoteData'
import { RemoteDataFactory } from '@airgap/coinlib-core/utils/remote-data/RemoteDataFactory'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeDefaults,
  KeyPair,
  newAmount,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  Secret,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { TezosContractRemoteDataFactory } from '../../contract/remote-data/TezosContractRemoteDataFactory'
import { TezosContract } from '../../contract/TezosContract'
import { TezosContractCall } from '../../contract/TezosContractCall'
import { createTezosIndexerClient } from '../../indexer/factory'
import { TezosIndexerClient } from '../../indexer/TezosIndexerClient'
import { BigMap } from '../../types/contract/bigmap/BigMap'
import { BigMapEntry } from '../../types/contract/bigmap/BigMapEntry'
import { TezosContractMetadata } from '../../types/contract/TezosContractMetadata'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { MichelineDataNode, MichelineNode } from '../../types/micheline/MichelineNode'
import { MichelsonType } from '../../types/michelson/MichelsonType'
import { TezosOperation } from '../../types/operations/kinds/TezosOperation'
import { TezosTransactionParameters, TezosWrappedTransactionOperation } from '../../types/operations/kinds/Transaction'
import { TezosOperationType } from '../../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../../types/operations/TezosWrappedOperation'
import { TezosFAProtocolNetwork, TezosFAProtocolOptions, TezosProtocolNetworkResolver, TezosUnits } from '../../types/protocol'
import { TezosSignedTransaction, TezosTransactionCursor, TezosUnsignedTransaction } from '../../types/transaction'
import { isFATokenMetadata } from '../../utils/fa'
import { isMichelineNode } from '../../utils/micheline'
import { parseHex } from '../../utils/pack'
import { TezosFAAccountant } from '../../utils/protocol/fa/TezosFAAccountant'
import { TEZOS_ACCOUNT_METADATA, TezosProtocol, TezosProtocolImpl } from '../TezosProtocol'

// Interface

export interface TezosFAProtocol<
  _Units extends string = string,
  _ProtocolNetwork extends TezosFAProtocolNetwork = TezosFAProtocolNetwork
> extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: _ProtocolNetwork
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
  contractMetadata(networkResolver?: TezosProtocolNetworkResolver): Promise<TezosContractMetadata | undefined>
  allTokenMetadata(): Promise<Record<number, TezosFATokenMetadata> | undefined>

  bigMapValue(key: string, isKeyHash?: boolean, bigMapId?: number): Promise<MichelineNode | undefined>

  normalizeTransactionParameters(parameters: string, fallbackEntrypointName?: string): Promise<TezosTransactionParameters>

  getTransactions(
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, _Units, TezosUnits>>
}

// Implementation

export const FA_MAINNET_SOURCE_ADDRESS: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'

export abstract class TezosFAProtocolImpl<
  _Entrypoints extends string,
  _Units extends string,
  _ProtocolNetwork extends TezosFAProtocolNetwork
> implements TezosFAProtocol<_Units, _ProtocolNetwork> {
  protected readonly options: TezosFAProtocolOptions<_Units, _ProtocolNetwork>

  protected readonly tezos: TezosProtocol
  protected readonly accountant: TezosFAAccountant<_Units>

  protected readonly indexer: TezosIndexerClient

  protected readonly contract: TezosContract<_Entrypoints>
  protected readonly remoteDataFactory: RemoteDataFactory

  protected constructor(options: TezosFAProtocolOptions<_Units, _ProtocolNetwork>, accountant: TezosFAAccountant<_Units>) {
    this.options = options

    this.tezos = new TezosProtocolImpl({ network: options.network })
    this.accountant = accountant
    this.indexer = createTezosIndexerClient(options.network.indexer)

    this.contract = new TezosContract(options.network.contractAddress, options.network)
    this.remoteDataFactory = new TezosContractRemoteDataFactory()

    this.metadata = {
      identifier: options.identifier,
      name: options.name,

      units: options.units,
      mainUnit: options.mainUnit,

      fee: {
        defaults: options.feeDefaults
      },

      account: TEZOS_ACCOUNT_METADATA
    }
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

  public async getType(): Promise<'token'> {
    return 'token'
  }

  public async getContractAddress(): Promise<string> {
    return this.options.network.contractAddress
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    return this.tezos.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    return this.tezos.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  // Offline

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair> {
    return this.tezos.getKeyPairFromSecret(secret, derivationPath)
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
    to: string[],
    configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<Amount<_Units>> {
    const balance: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)

    return balance.transferable ?? balance.total
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[]
  ): Promise<FeeDefaults<TezosUnits>> {
    const transferCalls: TezosContractCall[] = await this.createTransferCalls(publicKey, details)
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
    configuration?: TransactionConfiguration<TezosUnits>
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

  public async allTokenMetadata(): Promise<Record<number, TezosFATokenMetadata> | undefined> {
    const tokenMetadataBigMapId: number | undefined =
      this.options.network.tokenMetadataBigMapId ?? (await this.contract.findBigMap('token_metadata'))
    if (tokenMetadataBigMapId === undefined) {
      return undefined
    }

    const value: MichelsonType | undefined = await this.contract.bigMapValue(tokenMetadataBigMapId, {
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
    const rawValue: any = value?.asRawValue()
    const values: any[] = Array.isArray(rawValue) ? rawValue : [rawValue]
    const tokenMetadata: ([number, TezosFATokenMetadata] | undefined)[] = await Promise.all(
      values.map(async (value) => {
        const tokenID: number | undefined = value?.token_id?.toNumber()
        const tokenInfo: Map<string, string> = value?.token_info as Map<string, string>
        if (tokenID === undefined || tokenInfo === undefined) {
          return undefined
        }

        if (tokenInfo.has('')) {
          const uriEncoded: string = tokenInfo.get('')!
          const remoteData: RemoteData<unknown> | undefined = this.createRemoteData(uriEncoded)
          const tokenMetdata: unknown = await remoteData?.get()
          if (isFATokenMetadata(tokenMetdata)) {
            return [tokenID, tokenMetdata]
          }
        }

        const name: string | undefined = tokenInfo.get('name')
        const symbol: string | undefined = tokenInfo.get('symbol')
        const decimals: string | undefined = tokenInfo.get('decimals')

        if (!name || !symbol || !decimals) {
          return undefined
        }

        return [
          tokenID,
          {
            ...Array.from(tokenInfo.entries()).reduce((obj: Record<string, string | number | boolean>, next: [string, string]) => {
              const key: string = next[0]
              let value: string | number | boolean =
                typeof next[1] === 'string' && isHex(next[1]) ? hexToBytes(next[1]).toString() : next[1]
              if (value === 'true') {
                value = true
              } else if (value === 'false') {
                value = false
              } else if (!isNaN(parseInt(value, 10))) {
                value = parseInt(value, 10)
              }

              return Object.assign(obj, {
                [key]: value
              })
            }, {}),
            name: hexToBytes(name).toString(),
            symbol: hexToBytes(symbol).toString(),
            decimals: parseInt(hexToBytes(decimals).toString(), 10)
          }
        ]
      })
    )

    return tokenMetadata.reduce(
      (obj: Record<number, TezosFATokenMetadata>, next: [number, TezosFATokenMetadata] | undefined) =>
        next ? Object.assign(obj, { [next[0]]: next[1] }) : obj,
      {}
    )
  }

  protected async getTokenMetadataForTokenId(tokenId: number): Promise<TezosFATokenMetadata | undefined> {
    const tokenMetadata: Record<number, TezosFATokenMetadata> | undefined = await this.allTokenMetadata()

    return tokenMetadata ? tokenMetadata[tokenId] : undefined
  }

  private createRemoteData(uriEncoded: string): RemoteData<unknown> | undefined {
    // unless otherwise-specified, the encoding of the values must be the direct stream of bytes of the data being stored.
    let remoteData: RemoteData<unknown> | undefined = this.remoteDataFactory.create(hexToBytes(uriEncoded).toString().trim(), {
      contract: this.contract
    })
    if (!remoteData && uriEncoded.startsWith('05')) {
      // however, sometimes the URI is a packed value
      remoteData = this.remoteDataFactory.create(parseHex(uriEncoded).asRawValue(), { contract: this.contract })
    }

    return remoteData
  }

  public async bigMapValue(key: string, isKeyHash: boolean = false, bigMapId?: number): Promise<MichelineNode | undefined> {
    const bigMaps: BigMap[] = await this.contract.getBigMaps()
    const bigMap: BigMap | undefined = bigMapId !== undefined ? bigMaps.find((bigMap: BigMap) => bigMap.id === bigMapId) : bigMaps[0]
    if (!bigMap) {
      return undefined
    }
    const result: BigMapEntry | undefined = await this.contract.getBigMapValue({
      bigMap,
      key
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
    configuration?: TransactionConfiguration<TezosUnits>
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
      axios.get(this.url('/chains/main/blocks/head/'))
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
