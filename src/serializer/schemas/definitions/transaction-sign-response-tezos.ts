import { SignedTransaction } from './transaction-sign-response'

export interface SignedTezosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
