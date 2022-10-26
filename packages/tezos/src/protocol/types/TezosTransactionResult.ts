import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

import { TezosTransactionCursor } from './TezosTransactionCursor'

export interface TezosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: TezosTransactionCursor
}
