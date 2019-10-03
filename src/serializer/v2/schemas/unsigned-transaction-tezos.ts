import { UnsignedTransaction } from './unsigned-transaction'

interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}
