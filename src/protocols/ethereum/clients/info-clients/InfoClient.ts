import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { EthereumProtocol } from '../../EthereumProtocol'
import { EthereumTransactionCursor, EthereumTransactionResult } from '../../EthereumTypes'

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchTransactions(
    protocol: EthereumProtocol,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult>
  public abstract async fetchContractTransactions(
    protocol: EthereumProtocol,
    contractAddress: string,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]>
}
