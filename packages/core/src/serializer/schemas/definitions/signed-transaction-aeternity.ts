import { SignedTransaction } from './signed-transaction'

export interface SignedAeternityTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
