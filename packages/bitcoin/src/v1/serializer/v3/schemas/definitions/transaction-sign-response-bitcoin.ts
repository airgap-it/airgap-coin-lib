import { TransactionSignResponse } from '@airgap/serializer'

export interface BitcoinTransactionSignResponse extends TransactionSignResponse {
  from: string[]
  to: string[]
  amount: string
  fee: string
}
