import { RskProtocol } from '../../RskProtocol'
import { RskTransactionCursor, RskTransactionResult } from '../../RskTypes'

export abstract class RskInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract fetchTransactions(
    protocol: RskProtocol,
    address: string,
    limit: number,
    cursor?: RskTransactionCursor
  ): Promise<RskTransactionResult>
  public abstract fetchContractTransactions(
    protocol: RskProtocol,
    contractAddress: string,
    address: string,
    limit: number,
    cursor?: RskTransactionCursor
  ): Promise<RskTransactionResult>
}
