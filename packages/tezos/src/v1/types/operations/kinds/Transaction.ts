import { TezosContractEntrypointType } from '../../../contract/TezosContractEntrypoint'
import { MichelineNode } from '../../micheline/MichelineNode'
import { TezosOperationType } from '../TezosOperationType'
import { TezosWrappedOperation } from '../TezosWrappedOperation'

import { TezosOperation } from './TezosOperation'

export interface TezosTransactionParameters<Entrypoint extends string = string> {
  entrypoint: TezosContractEntrypointType | Entrypoint
  value: MichelineNode
}

export interface TezosWrappedTransactionOperation extends TezosWrappedOperation {
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
