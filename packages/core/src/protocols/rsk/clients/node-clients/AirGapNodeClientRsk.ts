import { RPCBody } from '../../../../data/RPCBody'
import axios, { AxiosError } from '../../../../dependencies/src/axios-0.19.0/index'
import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { InvalidValueError, NetworkError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { AirGapTransactionStatus } from '../../../../interfaces/IAirGapTransaction'
import { RPCConvertible } from '../../../cosmos/CosmosTransaction'
import { NODE_URL } from '../../RskProtocolOptions'
import { RskUtils } from '../../utils/utils'

import { RskNodeClient } from './RskNodeClient'

class RskRPCBody extends RPCBody implements RPCConvertible {
  public static blockEarliest: string = 'earliest'
  public static blockLatest: string = 'latest'
  public static blockPending: string = 'pending'

  public toRPCBody(): string {
    return JSON.stringify(this.toJSON())
  }

  public toJSON(): any {
    return {
      jsonrpc: this.jsonrpc,
      method: this.method,
      params: this.params,
      id: this.id
    }
  }
}

interface RskRPCResponse {
  id: number
  jsonrpc: string
  result?: any
  error?: {
    code: number
    message: string
  }
}

export class RskRPCData {
  // 2 chars = 1 byte hence to get to 32 bytes we need 64 chars
  protected static parametersLength: number = 64
  public methodSignature: string

  constructor(methodSignature: string) {
    this.methodSignature = methodSignature
  }

  public abiEncoded(): string {
    const hash = RskUtils.sha3(this.methodSignature)
    if (hash === null) {
      return ''
    }

    return `0x${hash.slice(2, 10)}`
  }

  public static addLeadingZeroPadding(value: string, targetLength: number = RskRPCData.parametersLength): string {
    let result = value
    while (result.length < targetLength) {
      result = '0' + result
    }

    return result
  }

  public static removeLeadingZeroPadding(value: string): string {
    let result = value
    while (result.startsWith('0')) {
      result = result.slice(1) // this can probably be done much more efficiently with a regex
    }

    return result
  }
}

export class RskRPCDataBalanceOf extends RskRPCData {
  public static methodName: string = 'balanceOf'
  public address: string

  constructor(address: string) {
    super(`${RskRPCDataBalanceOf.methodName}(address)`)
    this.address = address
  }

  public abiEncoded(): string {
    let srcAddress = this.address
    if (srcAddress.startsWith('0x')) {
      srcAddress = srcAddress.slice(2)
    }

    return super.abiEncoded() + RskRPCData.addLeadingZeroPadding(srcAddress)
  }
}

export class RskRPCDataTransfer extends RskRPCData {
  public static methodName: string = 'transfer'
  public recipient: string
  public amount: string

  constructor(toAddressOrData: string, amount?: string) {
    super(`${RskRPCDataTransfer.methodName}(address,uint256)`)
    if (amount) {
      const toAddress = toAddressOrData
      this.recipient = toAddress
      this.amount = amount
    } else {
      const data = toAddressOrData
      const methodID = super.abiEncoded()
      if (!data.startsWith(methodID)) {
        throw new InvalidValueError(Domain.RSK, 'unexpected method ID')
      }
      const params = data.slice(methodID.length)
      const recipient = RskRPCData.removeLeadingZeroPadding(params.slice(0, RskRPCData.parametersLength))
      const parsedAmount = RskRPCData.removeLeadingZeroPadding(params.slice(RskRPCData.parametersLength))
      this.recipient = `0x${recipient}`
      this.amount = `0x${parsedAmount}`
    }
  }

  public abiEncoded(): string {
    let dstAddress = this.recipient
    if (dstAddress.startsWith('0x')) {
      dstAddress = dstAddress.slice(2)
    }
    let transferAmount = this.amount
    if (transferAmount.startsWith('0x')) {
      transferAmount = transferAmount.slice(2)
    }

    return (
      super.abiEncoded() +
      RskRPCData.addLeadingZeroPadding(dstAddress.toLowerCase()) +
      RskRPCData.addLeadingZeroPadding(transferAmount.toLowerCase())
    )
  }
}

export class AirGapNodeClientRsk extends RskNodeClient {
  constructor(baseURL: string = NODE_URL) {
    super(baseURL)
  }

  public async fetchBalance(address: string): Promise<BigNumber> {
    const body = new RskRPCBody('eth_getBalance', [address, RskRPCBody.blockLatest])

    const response = await this.send(body)

    return new BigNumber(response.result)
  }

  public async fetchTransactionCount(address: string): Promise<number> {
    const body = new RskRPCBody('eth_getTransactionCount', [address, RskRPCBody.blockLatest])

    const response = await this.send(body)

    return new BigNumber(response.result).toNumber()
  }

  public async sendSignedTransaction(transaction: string): Promise<string> {
    const body = new RskRPCBody('eth_sendRawTransaction', [transaction])

    return (await this.send(body)).result
  }

  public async getTransactionStatus(transactionHash: string): Promise<AirGapTransactionStatus> {
    const body = new RskRPCBody('eth_getTransactionReceipt', [transactionHash])

    const response = await this.send(body)

    return response.result.status === '0x1' ? AirGapTransactionStatus.APPLIED : AirGapTransactionStatus.FAILED
  }

  public async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber> {
    const body = this.balanceOfBody(contractAddress, address)
    const response = await this.send(body)

    return new BigNumber(response.result)
  }

  public async callBalanceOfOnContracts(contractAddresses: string[], address: string): Promise<{ [contractAddress: string]: BigNumber }> {
    const bodies = contractAddresses.map((contractAddress, index) => this.balanceOfBody(contractAddress, address, index))
    const responses = await this.batchSend(bodies)
    const result: { [contractAddress: string]: BigNumber } = {}
    responses.forEach((response) => {
      result[contractAddresses[response.id]] = new BigNumber(response.result ?? 0)
    })

    return result
  }

  private balanceOfBody(contractAddress: string, address: string, id: number = 0): RskRPCBody {
    const data = new RskRPCDataBalanceOf(address)

    return new RskRPCBody('eth_call', [{ to: contractAddress, data: data.abiEncoded() }, RskRPCBody.blockLatest], id)
  }

  public async estimateTransactionGas(
    fromAddress: string,
    toAddress: string,
    amount?: string,
    data?: string,
    gas?: string
  ): Promise<BigNumber> {
    const body = new RskRPCBody('eth_estimateGas', [{ from: fromAddress, to: toAddress, gas, value: amount, data }])

    const response = await this.send(body)

    return new BigNumber(response.result)
  }

  public async estimateTransferGas(contractAddress: string, fromAddress: string, toAddress: string, hexAmount: string): Promise<BigNumber> {
    const data = new RskRPCDataTransfer(toAddress, hexAmount)
    const result = this.estimateTransactionGas(fromAddress, contractAddress, undefined, data.abiEncoded())

    return result
  }

  public async getGasPrice(): Promise<BigNumber> {
    const body = new RskRPCBody('eth_gasPrice', [])

    const response = await this.send(body)

    return new BigNumber(response.result)
  }

  private async send(body: RskRPCBody): Promise<RskRPCResponse> {
    const response = await axios
      .post(
        this.baseURL,
        body.toRPCBody(),
        { headers: { 'Content-Type': 'application/json' } } // RSK node accepts only 'application/json' requests
      )
      .catch((error) => {
        throw new NetworkError(Domain.RSK, error as AxiosError)
      })

    return response.data
  }

  private async batchSend(bodies: RskRPCBody[]): Promise<RskRPCResponse[]> {
    const data = (
      await axios.post(this.baseURL, JSON.stringify(bodies.map((body) => body.toJSON())), {
        headers: { 'Content-Type': 'application/json' }
      })
    ).data

    return data
  }
}
