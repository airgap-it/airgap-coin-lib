import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import * as bigInt from '../../../dependencies/src/big-integer-1.6.45/BigInteger'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import {
  TezosNetwork,
  TezosOperation,
  TezosOperationType,
  TezosProtocol,
  TezosSpendOperation,
  TezosWrappedOperation
} from '../TezosProtocol'

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
      promises.push(this.getBalance(address))
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
      throw new Error('Please provide a tz address as the source parameter')
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
      throw new Error('Please provide a tz address as the source parameter')
    } else if (source === undefined) {
      source = spenderAddress
    }
    const args = new TezosContractPair(new TezosContractPair(ownerAddress, spenderAddress), callbackContract)
    const getAllowanceCall = new TezosContractCall(TezosContractEntrypoint.allowance, args)
    return this.runContractCall(getAllowanceCall, source)
  }

  public async getTotalSupply(source: string, callbackContract: string = this.defaultCallbackContract){
    const args = new TezosContractPair( new TezosContractUnit(), callbackContract)
    const getTotalSupplyCall = new TezosContractCall(TezosContractEntrypoint.totalsupply, args)
    return this.runContractCall(getTotalSupplyCall,source)
  }

  public async getTotalMinted(source: string, callbackContract: string = this.defaultCallbackContract){
    const args = new TezosContractPair( new TezosContractUnit(), callbackContract)
    const getTotalMintedCall = new TezosContractCall(TezosContractEntrypoint.totalminted, args)
    return this.runContractCall(getTotalMintedCall,source)
  }

  public async getTotalBurned(source: string, callbackContract: string = this.defaultCallbackContract){
    const args = new TezosContractPair( new TezosContractUnit(), callbackContract)
    const getTotalBurnedCall = new TezosContractCall(TezosContractEntrypoint.totalburned, args)
    return this.runContractCall(getTotalBurnedCall,source)
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
    const transactions: IAirGapTransaction[] = response.data.map((transaction: any) => { return this.transactionToAirGapTransaction(transaction) })
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
      const transactionOperation: TezosSpendOperation = {
        kind: TezosOperationType.TRANSACTION,
        fee: fee,
        gas_limit: '400000',
        storage_limit: '60000',
        amount: '0',
        counter: counter.toFixed(),
        destination: this.contractAddress,
        source: source,
        code: `ff${contractCall.toHex()}`
      }

      operations.push(transactionOperation)
    }

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx: string = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  private url(path: string): string {
    return `${this.jsonRPCAPI}${path}`
  }

  public unforgeParameters(hexString: string): { result: { amount: BigNumber; destination: string }; rest: string } {
    const hexBytes: RegExpMatchArray | null = hexString.match(/.{2}/g)
    if (hexBytes === null) {
      throw new Error('Cannot parse contract code')
    }
    const contractCall: TezosContractCall = TezosContractCall.fromHex(hexBytes)
    switch (
    contractCall.entrypoint.name // TODO: this should be refactored, every case should call a function to do the job instead of doing it inline
    ) {
      case TezosContractEntrypointName.TRANSFER: {
        const pair: TezosContractPair = contractCall.args.second as TezosContractPair

        return {
          result: {
            amount: new BigNumber(pair.second as number),
            destination: pair.first as string
          },
          rest: hexBytes.join('')
        }
      }
      case TezosContractEntrypointName.APPROVE: {
        const pair: TezosContractPair = contractCall.args

        return {
          result: {
            amount: new BigNumber(pair.second as number),
            destination: pair.first as string
          },
          rest: hexBytes.join('')
        }
      }
      default:
        return {
          result: {
            amount: new BigNumber(0),
            destination: ''
          },
          rest: hexBytes.join('')
        }
    }
  }

  protected formatContractData(
    source: string,
    amount: BigNumber,
    destination: string,
    contractData: any
  ): {
    source: string
    amount: BigNumber
    destination: string
  } {
    return {
      source: source,
      amount: contractData.amount,
      destination: contractData.destination
    }
  }
}

abstract class TezosContractEntity {
  abstract toJSON(): any
  abstract toHex(): string

  protected stringToHex(value: string): string {
    return value
      .split('')
      .map(c => c.charCodeAt(0).toString(16))
      .join('')
  }

  protected static hexToString(hex: string[]): string {
    return hex.map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
  }

  protected lengthToHex(length: number, nBytes: number): string {
    const count = nBytes * 2
    const hexLength = (length / 2).toString(16)
    const prefix = '0'.repeat(count - hexLength.length)
    return `${prefix}${hexLength}`
  }

  static hexToLength(hex: string[]): number {
    const stringValue = hex.reduce((previous, next) => {
      if (next === '00') {
        return previous
      }
      return `${previous}${next}`
    }, '')

    if (stringValue.length > 0) {
      return parseInt(stringValue, 16)
    }
    return 0
  }

  /**
   * Encodes a signed integer into hex.
   * Copied from conseil.js
   * @param value Number to be encoded.
   */
  protected encodeSignedInt(value: any): string {
    let n = bigInt(value).abs()
    if (n.isZero()) {
      return '00'
    }
    
    const l = n.bitLength().toJSNumber()

    const arr: number[] = []
    let v = n
    for (let i = 0; i < l; i += 7) {
      let byte = bigInt.zero

      if (i === 0) {
        byte = v.and(0x3f) // first byte makes room for sign flag
        v = v.shiftRight(6)
      } else {
        byte = v.and(0x7f) // NOT base128 encoded
        v = v.shiftRight(7)
      }

      if (value < 0 && i === 0) {
        byte = byte.or(0x40)
      } // set sign flag

      if (i + 7 < l) {
        byte = byte.or(0x80)
      } // set next byte flag
      arr.push(byte.toJSNumber())
    }

    if (l % 7 === 0) {
      arr[arr.length - 1] = arr[arr.length - 1] | 0x80
      arr.push(1)
    }

    const result =  arr.map(v => ('0' + v.toString(16)).slice(-2)).join('')
    console.log("RETURNING", result)
    return result
  }

  static decodeSignedInt(hex: string): number {
    const positive = Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40 ? false : true
    const arr = Buffer.from(hex, 'hex').map((v, i) => (i === 0 ? v & 0x3f : v & 0x7f))
    let n = bigInt.zero
    for (let i = arr.length - 1; i >= 0; i--) {
      if (i === 0) {
        n = n.or(arr[i])
      } else {
        n = n.or(bigInt(arr[i]).shiftLeft(7 * i - 1))
      }
    }

    return positive ? n.toJSNumber() : n.negate().toJSNumber()
  }
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

  toHex(): string {
    const entrypointHex = this.stringToHex(this.name)
    let result = this.lengthToHex(entrypointHex.length, 1)
    result += entrypointHex
    return result
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

  static fromHex(hex: string[]): TezosContractEntrypoint {
    const entrypoint = TezosContractEntity.hexToString(hex)
    return TezosContractEntrypoint.fromString(entrypoint)
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

  toHex(): string {
    const args = this.argumentsToHex(this.toJSON())
    const length = this.lengthToHex(args.length, 4)
    return `${length}${args}`
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

  static fromHex(hex: string[]): TezosContractPair {
    const type1 = hex.shift()
    const type2 = hex.shift()
    if (type1 === '07' && type2 == '07') {
      // prim/pair
      return TezosContractPair.parsePair(hex)
    }
    throw new Error('Type not supported')
  }

  static parsePair(hex: string[]): TezosContractPair {
    const first = TezosContractPair.hexToArguments(hex)
    const second = TezosContractPair.hexToArguments(hex)
    return new TezosContractPair(first, second)
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

  private argumentsToHex(args: any): string {
    let result = ''
    if (args.prim !== undefined && args.prim === 'Pair') {
      result += '0707' // prim/Pair
      const pair: any[] = args.args
      for (const arg of pair) {
        result += this.argumentsToHex(arg)
      }
    } else if (args.int !== undefined) {
      console.log("ARGS", args.int)
      result += `00${this.encodeSignedInt(args.int)}`
    } else if (args.string !== undefined) {
      const value = this.stringToHex(args.string)
      result += `01${this.lengthToHex(value.length, 4)}${value}`
    } else {
      throw new Error('Prim type not supported')
    }

    return result
  }

  static hexToArguments(hex: string[]): string | number | TezosContractPair {
    const type = hex.shift()
    switch (type) {
      case '07': // prim
        const primType = hex.shift()
        if (primType === '07') {
          // pair
          return TezosContractPair.parsePair(hex)
        }
        throw new Error('Prim type not supported')
      case '00': // int
        const intBytes: string[] = []
        let byte: string | undefined
        do {
          byte = hex.shift()
          if (byte === undefined) {
            break
          }
          intBytes.push(byte)
        } while (parseInt(byte, 16).toString(2)[0] !== '0')
        return TezosContractPair.decodeSignedInt(intBytes.join(''))
      case '01':
        const lengthBytes = TezosContractPair.hexToLength(hex.splice(0, 4))
        return TezosContractPair.hexToString(hex.splice(0, lengthBytes))
      default:
        throw new Error('Type not supported')
    }
  }
}

class TezosContractUnit extends TezosContractEntity {

  toJSON() {
    return { prim: "Unit" }
  }  
  
  toHex(): string {
    throw new Error("Method not implemented.")
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

  toHex(): string {
    let result = 'ff'
    result += this.entrypoint.toHex()
    result += this.args.toHex()
    return result
  }

  static fromJSON(json: any): TezosContractCall {
    const entrypoint = TezosContractEntrypoint.fromJSON(json.entrypoint)
    const args = TezosContractPair.fromJSON(json.value)
    return new TezosContractCall(entrypoint, args)
  }

  static fromHex(hexBytes: string[]): TezosContractCall {
    if (hexBytes.splice(0, 1)[0] !== 'ff') {
      throw new Error('Cannot parse hex string')
    }
    const entrypointLength = TezosContractCall.hexToLength(hexBytes.splice(0, 1))
    const entrypoint = TezosContractEntrypoint.fromHex(hexBytes.splice(0, entrypointLength))
    hexBytes.splice(0, 4) // Remove total length of args because it is not needed
    const args = TezosContractPair.fromHex(hexBytes)

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
