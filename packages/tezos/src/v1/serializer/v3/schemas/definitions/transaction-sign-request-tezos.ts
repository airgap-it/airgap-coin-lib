import { TransactionSignRequest } from '@airgap/serializer'

import { TezosUnsignedTransaction } from '../../../../types/transaction'

interface SerializableTezosUnsignedTransaction {
  binaryTransaction: TezosUnsignedTransaction['binary']
}

export interface TezosTransactionSignRequest extends TransactionSignRequest<SerializableTezosUnsignedTransaction> {}
