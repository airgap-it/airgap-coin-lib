import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'

export interface SignedEthereumTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
