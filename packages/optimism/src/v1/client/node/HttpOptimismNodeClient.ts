// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { HttpEthereumNodeClient, EthereumRPCBody, EthereumRPCData, EthereumUnsignedTransaction, EthereumUtils } from '@airgap/ethereum/v1'
import { Transaction } from '@ethereumjs/tx'

import { OptimismNodeClient } from './OptimismNodeClient'

class OptimismRPCDataGetL1Fee extends EthereumRPCData {
  public static methodName: string = 'getL1Fee'
  private readonly bytes: Buffer

  constructor(tx: EthereumUnsignedTransaction) {
    super(`${OptimismRPCDataGetL1Fee.methodName}(bytes)`)
    this.bytes =
      tx.ethereumType === 'raw'
        ? Transaction.fromTxData({
            nonce: tx.nonce,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
            to: tx.to,
            value: tx.value,
            data: tx.data
          }).serialize()
        : Buffer.from(tx.serialized, 'hex')
  }

  public abiEncoded(): string {
    let bytesLength = EthereumUtils.toHex(this.bytes.length)
    if (bytesLength.startsWith('0x')) {
      bytesLength = bytesLength.slice(2)
    }

    return super.abiEncoded() + EthereumRPCData.addLeadingZeroPadding(bytesLength + this.bytes.toString('hex'), 256)
  }
}

export class HttpOptimismNodeClient extends HttpEthereumNodeClient implements OptimismNodeClient {
  constructor(baseURL: string, headers?: any) {
    super(baseURL, headers)
  }

  public async getL1Fee(contractAddress: string, tx: EthereumUnsignedTransaction): Promise<BigNumber> {
    const data = new OptimismRPCDataGetL1Fee(tx)
    const body = new EthereumRPCBody('eth_call', [{ to: contractAddress, data: data.abiEncoded() }, EthereumRPCBody.blockLatest])

    const response = await this.send(body)
    const fee = new BigNumber(response.result)

    return fee.isNaN() ? new BigNumber(0) : fee
  }
}
