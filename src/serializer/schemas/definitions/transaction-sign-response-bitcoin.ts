import { SignedTransaction } from './transaction-sign-response'

export interface SignedBitcoinTransaction extends SignedTransaction {
  from: string[]
  to: string[]
  amount: string
  fee: string
  accountIdentifier: string
  transaction: string
}
