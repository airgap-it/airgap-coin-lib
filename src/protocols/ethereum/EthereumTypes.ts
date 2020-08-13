import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface EthereumTransactionCursor {
  lastBlockLevel: number
}

export interface EthereumTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: EthereumTransactionCursor
}
