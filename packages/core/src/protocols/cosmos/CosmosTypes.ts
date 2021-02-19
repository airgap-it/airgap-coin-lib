import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface CosmosTransactionCursor {
  address: string
  limit: number
  sender: {
    page: number
    totalPages: number
    count: number
    totalCount: number
  }
  receipient: {
    page: number
    totalPages: number
    count: number
    totalCount: number
  }
}

export interface CosmosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: CosmosTransactionCursor
}
