import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'

export abstract class EthereumNodeClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchBalance(address: string): Promise<BigNumber>
  public abstract async fetchTransactionCount(address: string): Promise<number>
  public abstract async sendSignedTransaction(transaction: string): Promise<string>
  public abstract async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber>
  public abstract async estimateTransferGas(
    contractAddress: string,
    fromAddress: string,
    toAddress: string,
    hexAmount: string
  ): Promise<number>
}
