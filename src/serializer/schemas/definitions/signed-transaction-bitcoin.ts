import { SignedTransaction } from './signed-transaction'

export interface SignedBitcoinTransaction extends SignedTransaction {
  from: string[]
  amount: string
  fee: string
  accountIdentifier: string
  transaction: string
}
