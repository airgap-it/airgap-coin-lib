import { TransactionSignRequest } from '@airgap/serializer'

import { BitcoinSegwitUnsignedTransaction } from '../../../../types/transaction'

export interface BitcoinSegwitTransactionSignRequest extends TransactionSignRequest<BitcoinSegwitUnsignedTransaction> {}
