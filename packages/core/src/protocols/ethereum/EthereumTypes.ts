import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface EthereumTransactionCursor {
  page: number
}

export interface EthereumTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: EthereumTransactionCursor
}
