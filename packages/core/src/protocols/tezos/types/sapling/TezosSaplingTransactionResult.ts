import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { TezosSaplingTransactionCursor } from './TezosSaplingTransactionCursor'

export interface TezosSaplingTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: TezosSaplingTransactionCursor
}
