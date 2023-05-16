import { TransactionSignRequest } from '@airgap/serializer'

import { ICPTransaction } from '../../../../types/transaction'

interface SerializableICPUnsignedTransaction {
  networkId?: string
  transaction?: string
  transactions?: ICPTransaction[]
}

export interface ICPTransactionSignRequest extends TransactionSignRequest<SerializableICPUnsignedTransaction> {}
