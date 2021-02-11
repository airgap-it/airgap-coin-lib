import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface AeternityTransactionCursor {
  page: number
}

export interface AeternityTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: AeternityTransactionCursor
}
