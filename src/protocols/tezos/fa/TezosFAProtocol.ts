import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { isMichelineNode } from '../contract/micheline/utils'
import { MichelsonAddress } from '../contract/michelson/MichelsonAddress'
import { MichelsonBytes } from '../contract/michelson/MichelsonBytes'
import { MichelsonString } from '../contract/michelson/MichelsonString'
import { TezosContract } from '../contract/TezosContract'
import { TezosContractCall, TezosContractCallJSON } from '../contract/TezosContractCall'
import { TezosNetwork, TezosProtocol } from '../TezosProtocol'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'

import { FeeDefaults } from './../../ICoinProtocol'

enum ContractEntrypointName {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply',
  TOTAL_MINTED = 'getTotalMinted',
  TOTAL_BURNED = 'getTotalBurned'
}

export interface TezosFAProtocolConfiguration {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
  feeDefaults: FeeDefaults
  decimals?: number
  jsonRPCAPI?: string
  baseApiUrl?: string
  network?: TezosNetwork
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

export class TezosFAProtocol extends TezosProtocol implements ICoinSubProtocol {
  public readonly isSubProtocol: boolean = true
  public readonly subProtocolType: SubProtocolType = SubProtocolType.TOKEN
  public readonly identifier: string
  public readonly contractAddress: string

  protected readonly contract: TezosContract

  private readonly defaultCallbackContractMap = new Map<TezosNetwork, string>()
  private readonly defaultSourceAddress: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'

  constructor(configuration: TezosFAProtocolConfiguration) {
    super(configuration.jsonRPCAPI, configuration.baseApiUrl, configuration.network, configuration.baseApiNetwork, configuration.baseApiKey)
    this.contractAddress = configuration.contractAddress
    this.symbol = configuration.symbol
    this.name = configuration.name
    this.marketSymbol = configuration.marketSymbol
    this.identifier = configuration.identifier
    this.feeDefaults = configuration.feeDefaults
    this.decimals = configuration.decimals || this.decimals
    this.defaultCallbackContractMap.set(TezosNetwork.MAINNET, 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u')
    this.defaultCallbackContractMap.set(TezosNetwork.CARTHAGENET, 'KT1J8FmFLSgMz5H2vexFmsCtTLVod9V49iyW')
    this.contract = new TezosContract({
      address: this.contractAddress,
      nodeRPCURL: this.jsonRPCAPI,
      conseilAPIURL: this.baseApiUrl,
      conseilNetwork: this.baseApiNetwork,
      conseilAPIKey: this.headers.apiKey
    })
  }

  public async bigMapValue(key: string, isKeyHash: boolean = false): Promise<string | null> {
    return this.contract.bigMapValue(key, isKeyHash)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const promises: Promise<string>[] = []
    for (const address of addresses) {
      promises.push(this.getBalance(address, this.defaultSourceAddress))
    }
    const results: string[] = await Promise.all(promises)

    return results.reduce((current, next) => current.plus(new BigNumber(next)), new BigNumber(0)).toFixed()
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    // return this.feeDefaults
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }
    const transferCalls = await this.createTransferCalls(publicKey, recipients, values, this.feeDefaults.medium, data)
    const operations: TezosOperation[] = transferCalls.map((transferCall: TezosContractCall) => {
      return {
        kind: TezosOperationType.TRANSACTION,
        amount: '0',
        destination: this.contractAddress,
        parameters: transferCall.toJSON(),
        fee: '0'
      }
    })

    return this.estimateFeeDefaultsForOperations(publicKey, operations)
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    const transferCalls = await this.createTransferCalls(publicKey, recipients, values, fee, data)

    return this.prepareContractCall(transferCalls, fee, publicKey)
  }

  private async createTransferCalls(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<TezosContractCall[]> {
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }

    // check if we got an address-index
    const addressIndex: number = data && data.addressIndex ? data.addressIndex : 0
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

    if (!addresses[addressIndex]) {
      throw new Error('no kt-address with this index exists')
    }

    const fromAddress: string = addresses[addressIndex]

    const transferCalls: TezosContractCall[] = []
    for (let i: number = 0; i < recipients.length; i++) {
      const transferCall = await this.contract.createContractCall(ContractEntrypointName.TRANSFER, {
        from: fromAddress,
        to: recipients[i],
        value: new BigNumber(values[i]).toNumber()
      })
      transferCalls.push(transferCall)
    }

    return transferCalls
  }

  public async getBalance(address: string, source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    if (address.toLowerCase().startsWith('kt') && (source === undefined || source.toLowerCase().startsWith('kt'))) {
      source = this.defaultSourceAddress
    } else if (source === undefined) {
      source = address
    }

    const getBalanceCall = await this.contract.createContractCall(ContractEntrypointName.BALANCE, [{
      owner: address
    }, callbackContract])

    return this.runContractCall(getBalanceCall, source)
  }

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.callbackContract(),
    source?: string
  ): Promise<string> {
    if (spenderAddress.toLowerCase().startsWith('kt') && (source === undefined || source.toLowerCase().startsWith('kt'))) {
      source = this.defaultSourceAddress
    } else if (source === undefined) {
      source = spenderAddress
    }
    const getAllowanceCall = await this.contract.createContractCall(ContractEntrypointName.ALLOWANCE, [{
      owner: ownerAddress,
      spender: spenderAddress
    }, callbackContract])

    return this.runContractCall(getAllowanceCall, source)
  }

  public async getTotalSupply(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }

    const getTotalSupplyCall = await this.contract.createContractCall(ContractEntrypointName.TOTAL_SUPPLY, [
      [], 
      callbackContract
    ])

    return this.runContractCall(getTotalSupplyCall, source)
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const getTotalMintedCall = await this.contract.createContractCall(ContractEntrypointName.TOTAL_MINTED, [
      [],
      callbackContract
    ])

    return this.runContractCall(getTotalMintedCall, source)
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const getTotalBurnedCall = await this.contract.createContractCall(ContractEntrypointName.TOTAL_BURNED, [
      [],
      callbackContract
    ])

    return this.runContractCall(getTotalBurnedCall, source)
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const transferCall = await this.contract.createContractCall(ContractEntrypointName.TRANSFER, {
      from: fromAddress,
      to: toAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const approveCall = await this.contract.createContractCall(ContractEntrypointName.APPROVE, {
      spender: spenderAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([approveCall], fee, publicKey)
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

    return Promise.all(allTransactions
      .reduce((current, next) => current.concat(next))
      .map((transaction: any) => {
        return this.transactionToAirGapTransaction(transaction, addresses)
      })
    )
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
    const transactions: IAirGapTransaction[] = await Promise.all(response.data.map((transaction: any) => {
      return this.transactionToAirGapTransaction(transaction)
    }))
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
  ): Promise<TezosContractCallJSON> {
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

  public async transferDetailsFromParameters(parameters: TezosContractCallJSON): Promise<{ from: string; to: string; amount: string }> {
    if (parameters.entrypoint !== ContractEntrypointName.TRANSFER) {
      throw new Error('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')
    }
    const contractCall: TezosContractCall = await this.contract.parseContractCall(parameters)
    const amount: string | undefined = contractCall.argument<MichelsonString>('value')?.value

    const fromAddress: MichelsonString | MichelsonBytes | undefined = contractCall.argument<MichelsonAddress>('from')?.address
    let from: string | undefined
    if (fromAddress && Buffer.isBuffer(fromAddress.value)) {
      from = await this.getAddressFromPublicKey(fromAddress.value.toString('hex')) 
    } else if (fromAddress && typeof fromAddress.value === 'string') {
      from = fromAddress.value
    }

    const toAddress: MichelsonString | MichelsonBytes | undefined = contractCall.argument<MichelsonAddress>('to')?.address
    let to: string | undefined
    if (toAddress && Buffer.isBuffer(toAddress.value)) {
      to = await this.getAddressFromPublicKey(toAddress.value.toString('hex')) 
    } else if (toAddress && typeof toAddress.value === 'string') {
      to = toAddress.value
    }

    return {
      amount: new BigNumber(amount || NaN).toFixed(), // in tzbtc
      from: from || '',
      to: to || ''
    }
  }

  private parseParameters(parameters: string): unknown {
    const toBeRemoved = 'Unparsable code: '
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }

    return JSON.parse(parameters)
  }

  private async transactionToAirGapTransaction(transaction: any, sourceAddresses?: string[]): Promise<IAirGapTransaction> {
    const parameters: string = transaction.parameters_micheline ?? transaction.parameters
    const parsedParameters: unknown = this.parseParameters(parameters)

    if (!isMichelineNode(parsedParameters)) {
      throw new Error('Transaction parameters are invalid.')
    }

    const transferData: TezosContractCallJSON = {
      entrypoint: transaction.parameters_entrypoints,
      value: parsedParameters
    }

    const { from, to, amount } = await this.transferDetailsFromParameters(transferData)
    const inbound = sourceAddresses !== undefined ? sourceAddresses.indexOf(to) !== -1 : false

    return {
      amount: new BigNumber(amount).toFixed(), // in tzbtc
      fee: new BigNumber(transaction.fee ?? 0).toFixed(), // in xtz
      from: [from],
      isInbound: inbound,
      protocolIdentifier: this.identifier,
      to: [to],
      hash: transaction.operation_group_hash,
      timestamp: transaction.timestamp / 1000,
      blockHeight: transaction.block_level,
      extra: {
        status: transaction.status
      }
    }
  }

  private callbackContract(): string {
    let result = this.defaultCallbackContractMap.get(this.network)
    if (result === undefined) {
      result = ''
    }

    return result
  }

  private async runContractCall(contractCall: TezosContractCall, source: string): Promise<string> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head/'))
    ])
    const counter = new BigNumber(results[0].data).plus(1)
    const branch = results[1].data.hash
    const chainID = results[1].data.chain_id
    const body = contractCall.toOperationJSONBody(chainID, branch, counter, source, this.contractAddress)
    try {
      const response = await axios.post(this.url('/chains/main/blocks/head/helpers/scripts/run_operation'), body, {
        headers: { 'Content-Type': 'application/json' }
      })
      const metadata = response.data.contents[0].metadata
      if (metadata.internal_operation_results !== undefined && metadata.operation_result.status === 'applied') {
        return metadata.internal_operation_results[0].parameters.value.int
      } else {
        throw new Error(metadata.operation_result.errors[0].id)
      }
    } catch (runOperationError) {
      console.error(runOperationError)

      return '0'
    }
  }

  private async prepareContractCall(
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

  private url(path: string): string {
    return `${this.jsonRPCAPI}${path}`
  }
}
