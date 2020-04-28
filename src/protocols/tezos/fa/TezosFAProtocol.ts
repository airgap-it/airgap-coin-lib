import { FeeDefaults } from './../../ICoinProtocol'
import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosNetwork, TezosProtocol } from '../TezosProtocol'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'
import { TezosTransactionOperation } from '../types/operations/Transaction'
import * as bs58check from '../../../dependencies/src/bs58check-2.1.2/index'

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
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const promises: Promise<string>[] = []
    for (const address of addresses) {
      promises.push(this.getBalance(address, this.defaultSourceAddress))
    }
    const results: string[] = await Promise.all(promises)

    return results.reduce((current, next) => current.plus(new BigNumber(next)), new BigNumber(0)).toFixed()
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, fee: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
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

  public async getBalance(address: string, source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
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
    callbackContract: string = this.callbackContract(),
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

  public async getTotalSupply(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), callbackContract)
    const getTotalSupplyCall = new TezosContractCall(TezosContractEntrypoint.totalsupply, args)
    return this.runContractCall(getTotalSupplyCall, source)
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.callbackContract()) {
    if (source === undefined) {
      source = this.defaultSourceAddress
    }
    const args = new TezosContractPair(new TezosContractUnit(), callbackContract)
    const getTotalMintedCall = new TezosContractCall(TezosContractEntrypoint.totalminted, args)
    return this.runContractCall(getTotalMintedCall, source)
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.callbackContract()) {
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
        const body = {
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

        return axios
          .post(`${this.baseApiUrl}/v2/data/tezos/${this.baseApiNetwork}/operations`, body, {
            // incoming txs
            headers: this.headers
          })
          .then(response => response.data)
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
    let parameters: string = transaction.parameters
    if (parameters.startsWith(toBeRemoved)) {
      parameters = parameters.slice(toBeRemoved.length)
    }
    const transferData = JSON.parse(parameters)
    const contractCall = TezosContractCall.fromJSON(transferData)
    const amount = (contractCall.args.second as TezosContractPair).second as number
    const from = contractCall.args.first as string
    const to = (contractCall.args.second as TezosContractPair).first as string
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
      const transactionOperation: TezosTransactionOperation = {
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
    if (json.bytes !== undefined) {
       return this.parseAddress(json.bytes)
    }
    if (json.prim !== undefined) {
      return TezosContractPair.fromJSON(json)
    }
    throw new Error('type not supported')
  }

  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  private static readonly tezosPrefixes: {
    tz1: Buffer
    tz2: Buffer
    tz3: Buffer
    kt: Buffer
    edpk: Buffer
    edsk: Buffer
    edsig: Buffer
    branch: Buffer
  } = {
    tz1: Buffer.from(new Uint8Array([6, 161, 159])),
    tz2: Buffer.from(new Uint8Array([6, 161, 161])),
    tz3: Buffer.from(new Uint8Array([6, 161, 164])),
    kt: Buffer.from(new Uint8Array([2, 90, 121])),
    edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
    edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
    edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
    branch: Buffer.from(new Uint8Array([1, 52]))
  }

  private static splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
    const result: string = payload.substr(0, length)
    const rest: string = payload.substr(length, payload.length - length)

    return { result, rest }
  }

  private static parseAddress(rawHexAddress: string): string {
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const contractIdTag: string = result
    if (contractIdTag === '00') {
      // tz address
      return this.parseTzAddress(rest)
    } else if (contractIdTag === '01') {
      // kt address
      return this.prefixAndBase58CheckEncode(rest.slice(0, -2), this.tezosPrefixes.kt)
    } else {
      throw new Error('address format not supported')
    }
  }

  private static parseTzAddress(rawHexAddress: string): string {
    // tz1 address
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const publicKeyHashTag: string = result
    if (publicKeyHashTag === '00') {
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz1)
    } else {
      throw new Error('address format not supported')
    }
  }

  private static prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')

    return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
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
