import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'

interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedAeternityTransaction extends UnsignedTransaction {
  transaction: RawAeternityTransaction
}
