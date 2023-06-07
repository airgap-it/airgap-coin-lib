// tslint:disable: max-classes-per-file
import { Domain, NetworkError } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  AirGapNodeClient as AirGapEthereumNodeClient,
  EthereumNodeClient,
  EthereumRPCBody,
  EthereumRPCData,
  EthereumRPCResponse,
  EthereumUnsignedTransaction,
  EthereumUtils
} from '@airgap/ethereum/v1'
import { AirGapTransactionStatus } from '@airgap/module-kit'
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

export class AirGapNodeClient extends OptimismNodeClient {
  private readonly ethereumNodeClient: EthereumNodeClient

  constructor(baseURL: string) {
    super(baseURL)
    this.ethereumNodeClient = new AirGapEthereumNodeClient(baseURL)
  }

  public async getL1Fee(contractAddress: string, tx: EthereumUnsignedTransaction): Promise<BigNumber> {
    const data = new OptimismRPCDataGetL1Fee(tx)
    const body = new EthereumRPCBody('eth_call', [{ to: contractAddress, data: data.abiEncoded() }, EthereumRPCBody.blockLatest])

    const response = await this.send(body)
    const fee = new BigNumber(response.result)

    return fee.isNaN() ? new BigNumber(0) : fee
  }

  public async fetchBalance(address: string): Promise<BigNumber> {
    return this.ethereumNodeClient.fetchBalance(address)
  }

  public async fetchTransactionCount(address: string): Promise<number> {
    return this.ethereumNodeClient.fetchTransactionCount(address)
  }

  public async sendSignedTransaction(transaction: string): Promise<string> {
    return this.ethereumNodeClient.sendSignedTransaction(transaction)
  }

  public async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber> {
    return this.ethereumNodeClient.callBalanceOf(contractAddress, address)
  }

  public async getTransactionStatus(transactionHash: string): Promise<AirGapTransactionStatus> {
    return this.ethereumNodeClient.getTransactionStatus(transactionHash)
  }

  public async estimateTransferGas(contractAddress: string, fromAddress: string, toAddress: string, hexAmount: string): Promise<BigNumber> {
    return this.ethereumNodeClient.estimateTransferGas(contractAddress, fromAddress, toAddress, hexAmount)
  }

  public async estimateTransactionGas(
    fromAddress: string,
    toAddress: string,
    amount?: string,
    data?: string,
    gas?: string
  ): Promise<BigNumber> {
    return this.ethereumNodeClient.estimateTransactionGas(fromAddress, toAddress, amount, data, gas)
  }

  public async getGasPrice(): Promise<BigNumber> {
    return this.ethereumNodeClient.getGasPrice()
  }

  public async callBalanceOfOnContracts(contractAddresses: string[], address: string): Promise<{ [contractAddress: string]: BigNumber }> {
    return this.ethereumNodeClient.callBalanceOfOnContracts(contractAddresses, address)
  }

  public async getContractName(contractAddress: string): Promise<string | undefined> {
    return this.ethereumNodeClient.getContractName(contractAddress)
  }

  public async getContractSymbol(contractAddress: string): Promise<string | undefined> {
    return this.ethereumNodeClient.getContractSymbol(contractAddress)
  }

  public async getContractDecimals(contractAddress: string): Promise<number | undefined> {
    return this.ethereumNodeClient.getContractDecimals(contractAddress)
  }

  private async send(body: EthereumRPCBody): Promise<EthereumRPCResponse> {
    const response = await axios.post(this.baseURL, body.toRPCBody()).catch((error) => {
      throw new NetworkError(Domain.ETHEREUM, error as AxiosError)
    })

    return response.data
  }
}
