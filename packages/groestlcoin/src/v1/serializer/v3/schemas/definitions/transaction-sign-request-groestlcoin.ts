import { BitcoinTransactionSignRequest } from '@airgap/bitcoin/v1'

import { GroestlcoinUnsignedTransaction } from '../../../../types/transaction'

export interface GroestlcoinTransactionSignRequest extends BitcoinTransactionSignRequest {
  transaction: Omit<GroestlcoinUnsignedTransaction, 'type'>
}
