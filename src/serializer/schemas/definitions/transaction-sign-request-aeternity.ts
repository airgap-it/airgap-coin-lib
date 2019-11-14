import { UnsignedTransaction } from './transaction-sign-request'

interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedAeternityTransaction extends UnsignedTransaction {
  transaction: RawAeternityTransaction
}
