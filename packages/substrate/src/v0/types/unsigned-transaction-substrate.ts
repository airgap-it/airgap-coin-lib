import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

interface RawSubstrateTransaction {
  encoded: string
}

export interface UnsignedSubstrateTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawSubstrateTransaction
}
