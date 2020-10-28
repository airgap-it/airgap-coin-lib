import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionStatus } from '../../../../interfaces/IAirGapTransaction'

export abstract class EthereumNodeClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchBalance(address: string): Promise<BigNumber>
  public abstract async fetchTransactionCount(address: string): Promise<number>
  public abstract async sendSignedTransaction(transaction: string): Promise<string>
  public abstract async callBalanceOf(contractAddress: string, address: string): Promise<BigNumber>
  public abstract async getTransactionStatus(transactionHash: string): Promise<AirGapTransactionStatus>
  public abstract async estimateTransferGas(
    contractAddress: string,
    fromAddress: string,
    toAddress: string,
    hexAmount: string
  ): Promise<BigNumber>

  public abstract async estimateTransactionGas(
    fromAddress: string,
    toAddress: string,
    amount?: string,
    data?: string,
    gas?: string
  ): Promise<BigNumber>
  public abstract async getGasPrice(): Promise<BigNumber>

  public abstract async callBalanceOfOnContracts(contractAddresses: string[], address: string): Promise<{[contractAddress: string]: BigNumber}>
}
