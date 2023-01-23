import { TransactionSignRequest } from '@airgap/serializer'

import { AeternityUnsignedTransaction } from '../../../../types/transaction'

export interface AeternityTransactionSignRequest extends TransactionSignRequest<Omit<AeternityUnsignedTransaction, 'type'>> {}
