import { TransactionSignRequest } from '@airgap/serializer'

import { TezosUnsignedTransaction } from '../../../../types/transaction'

export interface TezosTransactionSignRequest extends TransactionSignRequest<TezosUnsignedTransaction> {}
