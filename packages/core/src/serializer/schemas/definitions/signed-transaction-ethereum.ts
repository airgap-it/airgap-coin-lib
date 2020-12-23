import { SignedTransaction } from './signed-transaction'

export interface SignedEthereumTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
