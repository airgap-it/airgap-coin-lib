import { SignedTransaction } from './signed-transaction'

// transaction string is a stringified RawSubstrateTransaction
export interface SignedSubstrateTransaction extends SignedTransaction {}
