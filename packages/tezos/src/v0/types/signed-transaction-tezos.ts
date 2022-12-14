import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'

export interface SignedTezosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
