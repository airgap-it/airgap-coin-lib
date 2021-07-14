import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'

import { TezosTransactionCursor } from './TezosTransactionCursor'

export interface TezosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: TezosTransactionCursor
}
