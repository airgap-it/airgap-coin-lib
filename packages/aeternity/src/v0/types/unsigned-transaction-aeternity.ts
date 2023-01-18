import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedAeternityTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawAeternityTransaction
}
