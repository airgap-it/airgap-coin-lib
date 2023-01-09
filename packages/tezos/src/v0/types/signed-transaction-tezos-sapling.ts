import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

export interface SignedTezosSaplingTransaction extends TransactionSignResponse, TransactionSignResponseV2 {}
