import { TransactionSignRequest } from '@airgap/serializer'

import { ICPUnsignedTransaction } from '../../../../types/transaction'

export interface ICPTransactionSignRequest extends TransactionSignRequest<Omit<ICPUnsignedTransaction, 'type'>> {}
