import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

import { TezosSaplingTransactionCursor } from './TezosSaplingTransactionCursor'

export interface TezosSaplingTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: TezosSaplingTransactionCursor
}
