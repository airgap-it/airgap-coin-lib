import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'

interface RawSubstrateTransaction {
  encoded: string
}

export interface UnsignedSubstrateTransaction extends UnsignedTransaction {
  transaction: RawSubstrateTransaction
}
