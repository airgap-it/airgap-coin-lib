import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'

export interface SignedAeternityTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}
