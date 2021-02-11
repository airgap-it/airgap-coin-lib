import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface CosmosTransactionCursor {
  offset: number
}

export interface CosmosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: CosmosTransactionCursor
}
