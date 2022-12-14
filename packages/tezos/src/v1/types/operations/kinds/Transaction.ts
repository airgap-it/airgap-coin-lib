import { MichelineNode } from '../../micheline/MichelineNode'
import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosTransactionParameters {
  entrypoint: 'default' | 'root' | 'do' | 'set_delegate' | 'remove_delegate' | string
  value: MichelineNode
}

export interface TezosWrappedTransactionOperation extends TezosOperation {
  contents: TezosTransactionOperation[]
  signature: string
}

export interface TezosTransactionOperation extends TezosOperation {
  kind: TezosOperationType.TRANSACTION
  source: string
  fee: string
  counter: string
  gas_limit: string
  storage_limit: string
  amount: string
  destination: string
  parameters?: TezosTransactionParameters
}
