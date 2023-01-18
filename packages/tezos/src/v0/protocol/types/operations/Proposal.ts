import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosProposalOperation extends TezosOperation {
  kind: TezosOperationType.PROPOSALS
  period: string
  proposals: string[]
}
