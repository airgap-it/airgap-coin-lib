import axios, { AxiosResponse } from '../../../../dependencies/src/axios-0.19.0/index'
import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RPCConvertible } from '../../../cosmos/CosmosTransaction'
import { RPCBody } from '../../../../data/RPCBody'
import { EthereumUtils } from '../../utils/utils'

import { EthereumNodeClient } from './NodeClient'

class EthereumRPCBody extends RPCBody implements RPCConvertible {
  public static blockEarliest: string = 'earliest'
  public static blockLatest: string = 'latest'
  public static blockPending: string = 'pending'

  public toRPCBody(): string {
    return JSON.stringify({
      jsonrpc: this.jsonrpc,
      method: this.method,
      params: this.params,
      id: this.id
    })
  }
}

export class EthereumRPCData {
  // 2 chars = 1 byte hence to get to 32 bytes we need 64 chars
  protected static parametersLength: number = 64
  public methodSignature: string

  constructor(methodSignature: string) {
    this.methodSignature = methodSignature
  }

  public abiEncoded(): string {
    const hash = EthereumUtils.sha3(this.methodSignature)
    if (hash === null) {
      return ''
    }

    return `0x${hash.slice(2, 10)}`
  }

  public static addLeadingZeroPadding(value: string, targetLength: number = EthereumRPCData.parametersLength): string {
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

export class EthereumRPCDataBalanceOf extends EthereumRPCData {
  public static methodName: string = 'balanceOf'
  public address: string

  constructor(address: string) {
    super(`${EthereumRPCDataBalanceOf.methodName}(address)`)
    this.address = address
  }

  public abiEncoded(): string {
    let srcAddress = this.address
    if (srcAddress.startsWith('0x')) {
      srcAddress = srcAddress.slice(2)
    }

    return super.abiEncoded() + EthereumRPCData.addLeadingZeroPadding(srcAddress)
  }
}

export class EthereumRPCDataTransfer extends EthereumRPCData {
  public static methodName: string = 'transfer'
  public recipient: string
  public amount: string

  constructor(toAddressOrData: string, amount?: string) {
    super(`${EthereumRPCDataTransfer.methodName}(address,uint256)`)
    if (amount) {
      const toAddress = toAddressOrData
      this.recipient = toAddress
      this.amount = amount
    } else {
      const data = toAddressOrData
      const methodID = super.abiEncoded()
      if (!data.startsWith(methodID)) {
        throw new Error('unexpected method ID')
      }
      const params = data.slice(methodID.length)
      const recipient = EthereumRPCData.removeLeadingZeroPadding(params.slice(0, EthereumRPCData.parametersLength))
      const parsedAmount = EthereumRPCData.removeLeadingZeroPadding(params.slice(EthereumRPCData.parametersLength))
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
      EthereumRPCData.addLeadingZeroPadding(dstAddress.toLowerCase()) +
      EthereumRPCData.addLeadingZeroPadding(transferAmount.toLowerCase())
    )
  }
}

export class AirGapNodeClient extends EthereumNodeClient {
  constructor(baseURL: string = 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech') {
    super(baseURL)
  }

  public async fetchBalance(address: string): Promise<BigNumber> {
    const body = new EthereumRPCBody('eth_getBalance', [address, EthereumRPCBody.blockLatest])

    return this.send(body, response => {
      const balance: string = response.data.result

      return new BigNumber(balance)
    })
  }

  public async fetchTransactionCount(address: string): Promise<number> {
    const body = new EthereumRPCBody('eth_getTransactionCount', [address, EthereumRPCBody.blockLatest])

    return this.send(body, response => {
      const count: string = response.data.result

      return new BigNumber(count).toNumber()
    })
  }

  public async sendSignedTransaction(transaction: string): Promise<string> {
    const body = new EthereumRPCBody('eth_sendRawTransaction', [transaction])

    return this.send(body, response => {
      return response.data.result
    })
  }

  public async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber> {
    const data = new EthereumRPCDataBalanceOf(address)
    const body = new EthereumRPCBody('eth_call', [{ to: contractAddress, data: data.abiEncoded() }, EthereumRPCBody.blockLatest])

    return this.send(body, response => {
      return new BigNumber(response.data.result)
    })
  }

  public async estimateTransferGas(contractAddress: string, fromAddress: string, toAddress: string, hexAmount: string): Promise<number> {
    const data = new EthereumRPCDataTransfer(toAddress, hexAmount)
    const body = new EthereumRPCBody('eth_estimateGas', [
      { from: fromAddress, to: contractAddress, data: data.abiEncoded() },
      EthereumRPCBody.blockLatest
    ])

    return this.send(body, response => {
      return new BigNumber(response.data.result).toNumber()
    })
  }

  private async send<Result>(body: EthereumRPCBody, responseHandler: (response: AxiosResponse) => Result): Promise<Result> {
    return new Promise((resolve, reject) => {
      axios
        .post(this.baseURL, body.toRPCBody())
        .then(response => {
          resolve(responseHandler(response))
        })
        .catch(reject)
    })
  }
}
