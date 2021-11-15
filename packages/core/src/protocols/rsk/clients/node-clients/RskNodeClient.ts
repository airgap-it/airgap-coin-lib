import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionStatus } from '../../../../interfaces/IAirGapTransaction'

export abstract class RskNodeClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract fetchBalance(address: string): Promise<BigNumber>
  public abstract fetchTransactionCount(address: string): Promise<number>
  public abstract sendSignedTransaction(transaction: string): Promise<string>
  public abstract callBalanceOf(contractAddress: string, address: string): Promise<BigNumber>
  public abstract getTransactionStatus(transactionHash: string): Promise<AirGapTransactionStatus>
  public abstract estimateTransferGas(
    contractAddress: string,
    fromAddress: string,
    toAddress: string,
    hexAmount: string
  ): Promise<BigNumber>

  public abstract estimateTransactionGas(
    fromAddress: string,
    toAddress: string,
    amount?: string,
    data?: string,
    gas?: string
  ): Promise<BigNumber>
  public abstract getGasPrice(): Promise<BigNumber>

  public abstract callBalanceOfOnContracts(contractAddresses: string[], address: string): Promise<{ [contractAddress: string]: BigNumber }>
}
