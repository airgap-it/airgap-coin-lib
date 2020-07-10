import { TezosBlockHeader } from '../TezosBlockHeader'
import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosDoubleBakingEvidenceOperation extends TezosOperation {
  kind: TezosOperationType.DOUBLE_BAKING_EVIDENCE
  bh1: TezosBlockHeader
  bh2: TezosBlockHeader
}
