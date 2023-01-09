import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawTezosTransaction
}
