import { AirGapTransaction } from '@airgap/module-kit'

import { EthereumTransactionCursor } from '../../types/transaction'

export type EthereumInfoClientTransaction = Omit<AirGapTransaction, 'network'>
export interface EthereumInfoClientTransactionsResult {
  transactions: EthereumInfoClientTransaction[]
  cursor: {
    page: number
  }
}

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract fetchTransactions(
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumInfoClientTransactionsResult>
  public abstract fetchContractTransactions(
    contractAddress: string,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumInfoClientTransactionsResult>
}
