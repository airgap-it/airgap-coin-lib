import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { EthereumProtocol } from '../../EthereumProtocol'

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchTransactions(
    protocol: EthereumProtocol,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]>
  public abstract async fetchContractTransactions(
    protocol: EthereumProtocol,
    contractAddress: string,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]>
}
