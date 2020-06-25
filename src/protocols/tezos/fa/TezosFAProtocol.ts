import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosContract } from '../contract/TezosContract'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosContractEntrypoint } from '../contract/TezosContractEntrypoint'
import { TezosContractMethodSelector } from '../contract/TezosContractMethod'
import { TezosContractInt } from '../contract/TezosContractInt'
import { TezosContractString } from '../contract/TezosContractString'
import { TezosUtils } from '../TezosUtils'
import { TezosContractBytes } from '../contract/TezosContractBytes'
import { TezosContractEntity } from '../contract/TezosContractEntity'
import { TezosContractPair } from '../contract/TezosContractPair'
import { TezosContractUnit } from '../contract/TezosContractUnit'
import { TezosNetwork, TezosProtocol } from '../TezosProtocol'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'

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
    this.contract = new TezosContract(this.contractAddress, this.jsonRPCAPI, this.baseApiUrl, this.baseApiNetwork, this.headers.apiKey)
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
    const operations: TezosOperation[] = transferCalls.map((transfer) => {
      return {
        kind: TezosOperationType.TRANSACTION,
        amount: '0',
        destination: this.contractAddress,
        parameters: transfer.toJSON(),
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
      const args = new TezosContractPair(new TezosContractString(fromAddress), new TezosContractPair(new TezosContractString(recipients[i]), new TezosContractInt(new BigNumber(values[i]).toNumber())))
      transferCalls.push(new TezosContractCall(TezosContractEntrypoint.transfer, args))
    }

    return transferCalls
  }

  public async getBalance(address: string, source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    if (address.toLowerCase().startsWith('kt') && (source === undefined || source.toLowerCase().startsWith('kt'))) {
      source = this.defaultSourceAddress
    } else if (source === undefined) {
      source = address
    }
    const args = new TezosContractPair(new TezosContractString(address), new TezosContractString(callbackContract))
    const getBalanceCall = new TezosContractCall(TezosContractEntrypoint.balance, args)

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
    const args = new TezosContractPair(new TezosContractPair(new TezosContractString(ownerAddress), new TezosContractString(spenderAddress)), new TezosContractString(callbackContract))
    const getAllowanceCall = new TezosContractCall(TezosContractEntrypoint.allowance, args)

    return this.runContractCall(getAllowanceCall, source)
  }

  public async getTotalSupply(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), new TezosContractString(callbackContract))
    const getTotalSupplyCall = new TezosContractCall(TezosContractEntrypoint.totalsupply, args)

    return this.runContractCall(getTotalSupplyCall, source)
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), new TezosContractString(callbackContract))
    const getTotalMintedCall = new TezosContractCall(TezosContractEntrypoint.totalminted, args)

    return this.runContractCall(getTotalMintedCall, source)
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), new TezosContractString(callbackContract))
    const getTotalBurnedCall = new TezosContractCall(TezosContractEntrypoint.totalburned, args)

    return this.runContractCall(getTotalBurnedCall, source)
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const args = new TezosContractPair(new TezosContractString(fromAddress), new TezosContractPair(new TezosContractString(toAddress), new TezosContractInt(new BigNumber(amount).toNumber())))
    const transferCall = new TezosContractCall(TezosContractEntrypoint.transfer, args)

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const args = new TezosContractPair(new TezosContractString(spenderAddress), new TezosContractInt(new BigNumber(amount).toNumber()))
    const transferCall = new TezosContractCall(TezosContractEntrypoint.approve, args)

    return this.prepareContractCall([transferCall], fee, publicKey)
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

    return allTransactions
      .reduce((current, next) => current.concat(next))
      .map((transaction: any) => {
        return this.transactionToAirGapTransaction(transaction, addresses)
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
    const transactions: IAirGapTransaction[] = response.data.map((transaction: any) => {
      return this.transactionToAirGapTransaction(transaction)
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
  ): Promise<{ entrypoint: string; value: any }> {
    const parsedParameters = this.parseParameters(parameters)
    if (parsedParameters.entrypoint !== undefined && parsedParameters.entrypoint !== TezosContract.defaultMethodName) {
      return {
        entrypoint: parsedParameters.entrypoint,
        value: parsedParameters.value
      }
    }
    const params = parsedParameters.value !== undefined ? parsedParameters.value : parsedParameters
    const { selector, value } = TezosContractMethodSelector.fromJSON(params)
    const method = await this.contract.methodForSelector(selector, fallbackEntrypointName)

    return {
      entrypoint: method.name,
      value
    }
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    // there is no standard way to fetch token holders for now, every subclass needs to implement its own logic
    return []
  }

  public transferDetailsFromParameters(parameters: { entrypoint: string; value: any }): { from: string; to: string; amount: string } {
    if (parameters.entrypoint !== TezosContractEntrypoint.transfer.name) {
      throw new Error('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')
    }
    const contractCall = TezosContractCall.fromJSON(parameters)
    const amount = ((contractCall.args.second as TezosContractPair).second as TezosContractInt).value
    const from = this.getAddressFromContractCallParameter(contractCall.args.first)
    const to = this.getAddressFromContractCallParameter((contractCall.args.second as TezosContractPair).first)
    return {
      amount: new BigNumber(amount).toFixed(), // in tzbtc
      from,
      to
    }
  }

  private getAddressFromContractCallParameter(parameter: TezosContractEntity): string {
    if (parameter instanceof TezosContractString) {
      return (parameter as TezosContractString).value
    } else {
      return TezosUtils.parseAddress((parameter as TezosContractBytes).value)
    }
  } 

  private parseParameters(parameters: string): any {
    const toBeRemoved = 'Unparsable code: '
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }

    return JSON.parse(parameters)
  }

  private transactionToAirGapTransaction(transaction: any, sourceAddresses?: string[]): IAirGapTransaction {
    const parameters: string = transaction.parameters_micheline ?? transaction.parameters
    const transferData = {
      entrypoint: transaction.parameters_entrypoints,
      value: this.parseParameters(parameters)
    }
    const { from, to, amount } = this.transferDetailsFromParameters(transferData)
    const inbound = sourceAddresses !== undefined ? sourceAddresses.indexOf(transferData.value.args[1].args[0].string) !== -1 : false

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

  private async prepareContractCall(contractCalls: TezosContractCall[], fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const operations: TezosOperation[] = contractCalls.map((contractCall) => {
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
