import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'
export interface SignedAeternityTransaction extends TransactionSignResponse, TransactionSignResponseV2 {
  accountIdentifier: string
  transaction: string
}
