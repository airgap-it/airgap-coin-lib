import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosEndorsementOperation extends TezosOperation {
  kind: TezosOperationType.ENDORSEMENT
  level: string
}
