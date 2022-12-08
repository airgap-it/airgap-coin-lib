import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'

// transaction string is a stringified RawSubstrateTransaction
export interface SignedSubstrateTransaction extends SignedTransaction {}
