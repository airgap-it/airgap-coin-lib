import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

export interface SignedBitcoinSegwitTransaction extends TransactionSignResponse, TransactionSignResponseV2 {
  transaction: string // PSBT
  accountIdentifier: string // TODO: Where do we use this?
}
