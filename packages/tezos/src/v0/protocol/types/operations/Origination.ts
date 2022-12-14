import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosOriginationOperation extends TezosOperation {
  kind: TezosOperationType.DELEGATION
  source: string
  fee: string
  counter: string
  gas_limit: string
  storage_limit: string
  balance: string
  delegate?: string
  script: string
}
