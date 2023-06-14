import { TransactionSignRequest } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

import { OptimismRawUnsignedTransaction } from '../../../../types/transaction'

export interface SerializableOptimismRawUnsignedTransaction extends Omit<OptimismRawUnsignedTransaction, 'type' | 'ethereumType'> {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
  l1DataFee: string
}

export interface OptimismTransactionSignRequest extends TransactionSignRequest<SerializableOptimismRawUnsignedTransaction> {}
