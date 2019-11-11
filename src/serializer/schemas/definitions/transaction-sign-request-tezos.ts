import { UnsignedTransaction } from './transaction-sign-request'

interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}
