import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

interface RawEthereumTransaction {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
}

export interface UnsignedEthereumTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawEthereumTransaction
}
