import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface BitcoinTransactionCursor {
  offset: number
}

export interface BitcoinTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: BitcoinTransactionCursor
}

export interface BitcoinBlockbookTransactionCursor {
  page: number
}

export interface BitcoinBlockbookTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: BitcoinBlockbookTransactionCursor
}
