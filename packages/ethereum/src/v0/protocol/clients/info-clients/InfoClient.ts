import { BaseEthereumProtocol } from '../../BaseEthereumProtocol'
import { EthereumTransactionCursor, EthereumTransactionResult } from '../../EthereumTypes'

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract fetchTransactions(
    protocol: BaseEthereumProtocol<any, any>,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult>
  public abstract fetchContractTransactions(
    protocol: BaseEthereumProtocol<any, any>,
    contractAddress: string,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult>
}
