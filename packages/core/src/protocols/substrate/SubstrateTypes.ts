import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface SubstrateTransactionCursor {
  page: number
}

export interface SubstrateTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: SubstrateTransactionCursor
}
