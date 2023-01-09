import { TransactionSignResponse, TransactionSignResponseV2 } from '@airgap/serializer'

// transaction string is a stringified RawSubstrateTransaction
export interface SignedSubstrateTransaction extends TransactionSignResponse, TransactionSignResponseV2 {}
