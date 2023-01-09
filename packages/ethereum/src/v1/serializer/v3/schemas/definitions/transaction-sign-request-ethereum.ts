import { TransactionSignRequest } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

import { EthereumRawUnsignedTransaction } from '../../../../types/transaction'

export interface SerializableEthereumRawUnsignedTransaction extends EthereumRawUnsignedTransaction {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
}

export interface EthereumTransactionSignRequest extends TransactionSignRequest<SerializableEthereumRawUnsignedTransaction> {}
