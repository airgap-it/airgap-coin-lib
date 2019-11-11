import { SignedTransaction } from './transaction-sign-response'

export interface SignedAeternityTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
