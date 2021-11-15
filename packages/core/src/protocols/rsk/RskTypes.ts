import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface RskTransactionCursor {
  page: number
}

export interface RskTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: RskTransactionCursor
}
