import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosRevealOperation extends TezosOperation {
  kind: TezosOperationType.REVEAL
  source: string
  fee: string
  counter: string
  gas_limit: string
  storage_limit: string
  public_key: string
}
