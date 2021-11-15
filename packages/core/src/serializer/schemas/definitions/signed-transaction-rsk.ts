import { SignedTransaction } from './signed-transaction'

export interface SignedRskTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
