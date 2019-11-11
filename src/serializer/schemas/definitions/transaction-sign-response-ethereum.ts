import { SignedTransaction } from './transaction-sign-response'

export interface SignedEthereumTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
