import { TransactionSignRequest } from '@airgap/serializer'

import { BitcoinTaprootUnsignedTransaction } from '../../../../types/transaction'

export interface BitcoinTaprootTransactionSignRequest extends TransactionSignRequest<Omit<BitcoinTaprootUnsignedTransaction, 'type'>> {}
