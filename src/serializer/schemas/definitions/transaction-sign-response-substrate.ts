import { SignedTransaction } from './transaction-sign-response'

// transaction string is a stringified RawSubstrateTransaction
export interface SignedSubstrateTransaction extends SignedTransaction {}
