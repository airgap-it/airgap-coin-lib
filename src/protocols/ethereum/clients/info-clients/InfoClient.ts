import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchTransactions(identifier: string, address: string, page: number, limit: number): Promise<IAirGapTransaction[]>
  public abstract async fetchContractTransactions(
    identifier: string,
    contractAddress: string,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]>
}
