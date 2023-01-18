import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

export interface SignedEthereumTransaction extends TransactionSignResponse, TransactionSignResponseV2 {
  accountIdentifier: string
  transaction: string
}
