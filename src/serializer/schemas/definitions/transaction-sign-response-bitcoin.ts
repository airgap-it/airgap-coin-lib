import { SignedTransaction } from './transaction-sign-response'

export interface SignedBitcoinTransaction extends SignedTransaction {
  from: string[]
  amount: string
  fee: string
  accountIdentifier: string
  transaction: string
}
