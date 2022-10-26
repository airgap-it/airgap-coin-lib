import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'

export interface SignedBitcoinSegwitTransaction extends SignedTransaction {
  transaction: string // PSBT
  accountIdentifier: string // TODO: Where do we use this?
}
