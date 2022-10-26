import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'

interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}
