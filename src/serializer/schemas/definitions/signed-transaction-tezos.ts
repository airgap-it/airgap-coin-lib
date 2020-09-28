import { SignedTransaction } from './signed-transaction'

export interface SignedTezosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
