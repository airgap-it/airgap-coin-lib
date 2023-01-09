import { TransactionSignRequest } from '@airgap/serializer'

import { CosmosUnsignedTransaction } from '../../../../types/transaction'

export interface CosmosTransactionSignRequest extends TransactionSignRequest<CosmosUnsignedTransaction> {}
