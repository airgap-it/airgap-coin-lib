import { AccountTransaction } from '../types/indexer'

export interface MinaIndexer {
  getTransactions(publicKey: string, limit: number, dateTimeOffset?: string): Promise<AccountTransaction[]>
  getLatestFees(blockSpan: number): Promise<string[]>
}
