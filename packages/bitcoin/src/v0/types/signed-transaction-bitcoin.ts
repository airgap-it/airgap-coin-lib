import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

export interface SignedBitcoinTransaction extends TransactionSignResponse, TransactionSignResponseV2 {
  from: string[]
  to: string[]
  amount: string
  fee: string
  accountIdentifier: string
  transaction: string
}
