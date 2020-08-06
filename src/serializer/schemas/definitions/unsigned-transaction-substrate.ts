import { UnsignedTransaction } from './unsigned-transaction'

interface RawSubstrateTransaction {
  encoded: string
}

export interface UnsignedSubstrateTransaction extends UnsignedTransaction {
  transaction: RawSubstrateTransaction
}
