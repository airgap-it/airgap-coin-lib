import { TransactionSignRequest } from '@airgap/serializer'

import { TezosSaplingUnsignedTransaction } from '../../../../types/transaction'

export interface TezosSaplingTransactionSignRequest extends TransactionSignRequest<Omit<TezosSaplingUnsignedTransaction, 'type'>> {}
