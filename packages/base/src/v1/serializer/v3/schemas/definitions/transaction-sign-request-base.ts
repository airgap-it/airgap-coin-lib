import { TransactionSignRequest } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

import { BaseRawUnsignedTransaction } from '../../../../types/transaction'

export interface SerializableBaseRawUnsignedTransaction extends Omit<BaseRawUnsignedTransaction, 'type' | 'ethereumType'> {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
  l1DataFee: string
}

export interface BaseTransactionSignRequest extends TransactionSignRequest<SerializableBaseRawUnsignedTransaction> {}
