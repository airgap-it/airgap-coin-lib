import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosNetwork, TezosProtocol } from '../TezosProtocol'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'

export interface TezosFAProtocolConfiguration {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
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

  private readonly defaultCallbackContract: string = 'KT1JjN5bTE9yayzYHiBm6ruktwEWSHRF8aDm'
  private readonly defaultSourceAddress: string = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'

  constructor(configuration: TezosFAProtocolConfiguration) {
    super(configuration.jsonRPCAPI, configuration.baseApiUrl, configuration.network, configuration.baseApiNetwork, configuration.baseApiKey)
    this.contractAddress = configuration.contractAddress
    this.symbol = configuration.symbol
    this.name = configuration.name
    this.marketSymbol = configuration.marketSymbol
    this.identifier = configuration.identifier
    this.decimals = configuration.decimals || this.decimals
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const promises: Promise<string>[] = []
    for (const address of addresses) {
      promises.push(this.getBalance(address, this.defaultSourceAddress))
    }
    const results: string[] = await Promise.all(promises)

    return results.reduce((current, next) => current.plus(new BigNumber(next)), new BigNumber(0)).toFixed()
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
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
      const args = new TezosContractPair(fromAddress, new TezosContractPair(recipients[i], new BigNumber(values[i]).toNumber()))
      transferCalls.push(new TezosContractCall(TezosContractEntrypoint.transfer, args))
    }

    return this.prepareContractCall(transferCalls, fee, publicKey)
  }

  public async getBalance(address: string, source?: string, callbackContract: string = this.defaultCallbackContract): Promise<string> {
    if (address.toLowerCase().startsWith('kt') && (source === undefined || source.toLowerCase().startsWith('kt'))) {
      source = this.defaultSourceAddress
    } else if (source === undefined) {
      source = address
    }
    const args = new TezosContractPair(address, callbackContract)
    const getBalanceCall = new TezosContractCall(TezosContractEntrypoint.balance, args)
    return this.runContractCall(getBalanceCall, source)
  }

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.defaultCallbackContract,
    source?: string
  ): Promise<string> {
    if (spenderAddress.toLowerCase().startsWith('kt') && (source === undefined || source.toLowerCase().startsWith('kt'))) {
      source = this.defaultSourceAddress
    } else if (source === undefined) {
      source = spenderAddress
    }
    const args = new TezosContractPair(new TezosContractPair(ownerAddress, spenderAddress), callbackContract)
    const getAllowanceCall = new TezosContractCall(TezosContractEntrypoint.allowance, args)
    return this.runContractCall(getAllowanceCall, source)
  }

  public async getTotalSupply(source?: string, callbackContract: string = this.defaultCallbackContract) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), callbackContract)
    const getTotalSupplyCall = new TezosContractCall(TezosContractEntrypoint.totalsupply, args)
    return this.runContractCall(getTotalSupplyCall, source)
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.defaultCallbackContract) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), callbackContract)
    const getTotalMintedCall = new TezosContractCall(TezosContractEntrypoint.totalminted, args)
    return this.runContractCall(getTotalMintedCall, source)
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.defaultCallbackContract) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), callbackContract)
    const getTotalBurnedCall = new TezosContractCall(TezosContractEntrypoint.totalburned, args)
    return this.runContractCall(getTotalBurnedCall, source)
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
      addresses.map(address => {
        const getRequestBody = (inverse: boolean) => {
          return {
            predicates: [
              {
                field: 'parameters',
                operation: 'like',
                set: [address],
                inverse: false
              },
              {
                field: 'parameters',
                operation: 'like',
                set: ['"transfer"'],
                inverse: false
              },
              {
                field: 'kind',
                operation: 'eq',
                set: ['transaction'],
                inverse: false
              },
              {
                field: 'source',
                operation: 'eq',
                set: [address],
                inverse: inverse
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
            limit: limit
          }
        }

        return new Promise<any>(async (resolve, reject) => {
          const fromPromise = axios
            .post(`${this.baseApiUrl}/v2/data/tezos/${this.baseApiNetwork}/operations`, getRequestBody(false), {
              // incoming txs
              headers: this.headers
            })
            .catch(() => {
              return { data: [] }
            })
          const toPromise = axios
            .post(`${this.baseApiUrl}/v2/data/tezos/${this.baseApiNetwork}/operations`, getRequestBody(true), {
              // outgoing txs
              headers: this.headers
            })
            .catch(() => {
              return { data: [] }
            })
          const [to, from] = await Promise.all([fromPromise, toPromise])
          const transactions: any[] = to.data.concat(from.data)
          transactions.sort((a, b) => a.timestamp - b.timestamp)
          resolve([...to.data, ...from.data])
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
    let body = {
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
      limit: limit
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
      transactions: transactions,
      cursor: {
        lastBlockLevel: lastEntryBlockLevel
      }
    }
  }

  private transactionToAirGapTransaction(transaction: any, sourceAddresses?: string[]): IAirGapTransaction {
    const toBeRemoved = 'Unparsable code: '
    const transferData = JSON.parse(transaction.parameters.slice(toBeRemoved.length))
    const contractCall = TezosContractCall.fromJSON(transferData)
    const amount = (contractCall.args.second as TezosContractPair).second as number
    const from = contractCall.args.first as string
    const to = (contractCall.args.second as TezosContractPair).first as string
    const inbound = sourceAddresses !== undefined ? sourceAddresses.indexOf(transferData.value.args[1].args[0].string) !== -1 : false
    return {
      amount: new BigNumber(amount).toFixed(), // in tzbtc
      fee: new BigNumber(transaction.fee).toFixed(), // in xtz
      from: [from],
      isInbound: inbound,
      protocolIdentifier: this.identifier,
      to: [to],
      hash: transaction.operation_group_hash,
      timestamp: transaction.timestamp / 1000,
      blockHeight: transaction.block_level
    }
  }

  private async runContractCall(contractCall: TezosContractCall, source: string): Promise<string> {
    const results: AxiosResponse[] = await Promise.all([
      axios.get(this.url(`/chains/main/blocks/head/context/contracts/${source}/counter`)),
      axios.get(this.url('/chains/main/blocks/head'))
    ])
    const counter = new BigNumber(results[0].data).plus(1)
    const branch = results[1].data.hash
    const chainID = results[1].data.chain_id
    const body = contractCall.toOperationJSONBody(chainID, branch, counter, source, this.contractAddress)
    try {
      const response = await axios.post(this.url('/chains/main/blocks/head/helpers/scripts/run_operation'), body, {
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data.contents[0].metadata.internal_operation_results[0].result.storage.int
    } catch (runOperationError) {
      return '0'
    }
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const args = new TezosContractPair(fromAddress, new TezosContractPair(toAddress, new BigNumber(amount).toNumber()))
    const transferCall = new TezosContractCall(TezosContractEntrypoint.transfer, args)
    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const args = new TezosContractPair(spenderAddress, new BigNumber(amount).toNumber())
    const transferCall = new TezosContractCall(TezosContractEntrypoint.approve, args)
    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  private async prepareContractCall(contractCalls: TezosContractCall[], fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const operations: TezosOperation[] = []

    const source = await this.getAddressFromPublicKey(publicKey)

    const results: AxiosResponse[] = await Promise.all([
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${source}/counter`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${source}/manager_key`)
    ])

    const branch = results[1].data
    let counter = new BigNumber(results[0].data).plus(1)
    const accountManager: string = results[2].data

    if (!accountManager) {
      operations.push(await this.createRevealOperation(counter, publicKey, source))
      counter = counter.plus(1)
    }

    for (const contractCall of contractCalls) {
      const transactionOperation: any = {
        kind: TezosOperationType.TRANSACTION,
        fee: fee,
        gas_limit: '400000',
        storage_limit: '60000',
        amount: '0',
        counter: counter.toFixed(),
        destination: this.contractAddress,
        source: source,
        parameters: contractCall.toJSON()
      }

      operations.push(transactionOperation)
    }

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      console.log(JSON.stringify(tezosWrappedOperation, undefined, 2))

      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  private url(path: string): string {
    return `${this.jsonRPCAPI}${path}`
  }
}

abstract class TezosContractEntity {
  abstract toJSON(): any
}

enum TezosContractEntrypointName {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTALSUPPLY = 'getTotalSupply',
  TOTALMINTED = 'getTotalMinted',
  TOTALBURNED = 'getTotalBurned'
}

class TezosContractEntrypoint extends TezosContractEntity {
  static transfer = new TezosContractEntrypoint(TezosContractEntrypointName.TRANSFER)
  static balance = new TezosContractEntrypoint(TezosContractEntrypointName.BALANCE)
  static allowance = new TezosContractEntrypoint(TezosContractEntrypointName.ALLOWANCE)
  static approve = new TezosContractEntrypoint(TezosContractEntrypointName.APPROVE)
  static totalsupply = new TezosContractEntrypoint(TezosContractEntrypointName.TOTALSUPPLY)
  static totalminted = new TezosContractEntrypoint(TezosContractEntrypointName.TOTALMINTED)
  static totalburned = new TezosContractEntrypoint(TezosContractEntrypointName.TOTALBURNED)

  readonly name: TezosContractEntrypointName

  constructor(name: TezosContractEntrypointName) {
    super()
    this.name = name
  }

  toJSON(): any {
    return `${this.name}`
  }

  static fromJSON(json: any): TezosContractEntrypoint {
    if (typeof json !== 'string') {
      throw new Error('expected a string as input')
    }
    const name: string = json
    switch (name) {
      case TezosContractEntrypointName.TRANSFER:
        return new TezosContractEntrypoint(TezosContractEntrypointName.TRANSFER)
      case TezosContractEntrypointName.BALANCE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.BALANCE)
      case TezosContractEntrypointName.ALLOWANCE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.ALLOWANCE)
      case TezosContractEntrypointName.APPROVE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.APPROVE)
      default:
        throw new Error('unsupported entrypoint')
    }
  }

  static fromString(name: string): TezosContractEntrypoint {
    switch (name) {
      case TezosContractEntrypointName.BALANCE:
        return TezosContractEntrypoint.balance
      case TezosContractEntrypointName.APPROVE:
        return TezosContractEntrypoint.approve
      case TezosContractEntrypointName.ALLOWANCE:
        return TezosContractEntrypoint.allowance
      case TezosContractEntrypointName.TRANSFER:
        return TezosContractEntrypoint.transfer
      default:
        throw new Error('Cannot get entrypoint name from string')
    }
  }
}

class TezosContractPair extends TezosContractEntity {
  first: string | number | TezosContractEntity
  second: string | number | TezosContractEntity

  constructor(first: string | number | TezosContractEntity, second: string | number | TezosContractEntity) {
    super()
    this.first = first
    this.second = second
  }

  toJSON(): any {
    return {
      prim: 'Pair',
      args: [this.jsonEncodedArg(this.first), this.jsonEncodedArg(this.second)]
    }
  }

  static fromJSON(json: any): TezosContractPair {
    if (json.prim !== 'Pair') {
      throw new Error('type not supported')
    }
    return new TezosContractPair(this.argumentsFromJSON(json.args[0]), this.argumentsFromJSON(json.args[1]))
  }

  static argumentsFromJSON(json: any): string | number | TezosContractPair {
    if (json.string !== undefined) {
      return json.string
    }
    if (json.int !== undefined) {
      return parseInt(json.int)
    }
    if (json.prim !== undefined) {
      return TezosContractPair.fromJSON(json)
    }
    throw new Error('type not supported')
  }

  private jsonEncodedArg(arg: string | number | TezosContractEntity): any {
    switch (typeof arg) {
      case 'string':
        return { string: arg }
      case 'number':
        return { int: arg.toString() }
      default:
        return (arg as TezosContractEntity).toJSON()
    }
  }
}

class TezosContractUnit extends TezosContractEntity {
  toJSON() {
    return { prim: 'Unit' }
  }
}
class TezosContractCall extends TezosContractEntity {
  readonly entrypoint: TezosContractEntrypoint
  readonly args: TezosContractPair

  constructor(entrypoint: TezosContractEntrypoint, args: TezosContractPair) {
    super()
    this.entrypoint = entrypoint
    this.args = args
  }

  toOperationJSONBody(
    chainID: string,
    branch: string,
    counter: BigNumber,
    source: string,
    contractAddress: string,
    fee: string = '0'
  ): TezosRPCOperationBody {
    return {
      chain_id: chainID,
      operation: {
        branch: branch,
        signature: 'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP', // signature will not be checked, so it is ok to always use this one
        contents: [
          {
            kind: 'transaction',
            counter: counter.toFixed(),
            amount: '0',
            source: source,
            destination: contractAddress,
            fee: fee,
            gas_limit: '400000',
            storage_limit: '60000',
            parameters: this.toJSON()
          }
        ]
      }
    }
  }

  toJSON(): any {
    return {
      entrypoint: this.entrypoint.toJSON(),
      value: this.args.toJSON()
    }
  }

  static fromJSON(json: any): TezosContractCall {
    const entrypoint = TezosContractEntrypoint.fromJSON(json.entrypoint)
    const args = TezosContractPair.fromJSON(json.value)
    return new TezosContractCall(entrypoint, args)
  }
}

interface TezosRPCOperationBody {
  operation: TezosRPCOperation
  chain_id: string
}

interface TezosRPCOperation {
  branch: string
  contents: TezosRPCTransaction[]
  signature: string
}

interface TezosRPCTransaction {
  kind: 'transaction'
  counter: string
  amount: string
  source: string
  destination: string
  fee: string
  gas_limit: string
  storage_limit: string
  parameters?: TezosRPCTransactionParameters
}

interface TezosRPCTransactionParameters {
  entrypoint: String
  value: any
}
