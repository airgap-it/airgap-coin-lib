import { TransactionSignRequest } from '@airgap/serializer'

import { MinaUnsignedTransaction } from '../../../../types/transaction'

export interface MinaTransactionSignRequest extends TransactionSignRequest<Omit<MinaUnsignedTransaction, 'type'>> {}