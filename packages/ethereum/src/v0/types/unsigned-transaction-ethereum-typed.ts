import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

interface RawTypedEthereumTransaction {
  serialized: HexString
  derivationPath: string
  masterFingerprint: string
}

export interface UnsignedTypedEthereumTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawTypedEthereumTransaction
}
