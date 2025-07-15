import { TransactionSignRequest } from '@airgap/serializer'
import { StellarUnsignedTransaction } from '../../../../types/transaction'

export interface StellarTransactionSignRequest extends TransactionSignRequest<Omit<StellarUnsignedTransaction, 'type'>> {}
