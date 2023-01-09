import { TransactionSignRequest } from '@airgap/serializer'

import { BitcoinUnsignedTransaction } from '../../../../types/transaction'

export interface BitcoinTransactionSignRequest extends TransactionSignRequest<BitcoinUnsignedTransaction> {}
