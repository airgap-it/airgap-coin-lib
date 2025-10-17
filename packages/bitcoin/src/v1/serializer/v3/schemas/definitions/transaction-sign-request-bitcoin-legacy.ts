import { TransactionSignRequest } from '@airgap/serializer'

import { BitcoinLegacyUnsignedTransaction } from '../../../../types/transaction'

export interface BitcoinLegacyTransactionSignRequest extends TransactionSignRequest<Omit<BitcoinLegacyUnsignedTransaction, 'type'>> {}
