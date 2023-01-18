import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

export interface SignedCosmosTransaction extends TransactionSignResponse, TransactionSignResponseV2 {
  accountIdentifier: string
  transaction: string
}
