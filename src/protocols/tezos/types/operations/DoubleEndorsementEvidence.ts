import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface InlinedEndorsement {
  branch: string
  operations: InlinedEndorsementContents
  signature?: string
}

export interface InlinedEndorsementContents {
  kind: 'endorsement'
  level: string
}

export interface TezosDoubleEndorsementEvidenceOperation extends TezosOperation {
  kind: TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE
  op1: InlinedEndorsement
  op2: InlinedEndorsement
}
