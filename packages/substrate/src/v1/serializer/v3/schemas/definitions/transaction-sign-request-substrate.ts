import { TransactionSignRequest } from '@airgap/serializer'

import { SubstrateUnsignedTransaction } from '../../../../types/transaction'

export interface SubstrateTransactionSignRequest extends TransactionSignRequest<SubstrateUnsignedTransaction> {}
