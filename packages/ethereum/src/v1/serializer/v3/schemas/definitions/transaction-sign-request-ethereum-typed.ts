import { TransactionSignRequest } from '@airgap/serializer'
import { HexString } from '@airgap/serializer/v3/schemas/definitions/hex-string'

import { EthereumTypedUnsignedTransaction } from '../../../../types/transaction'

export interface SerializableEthereumTypedUnsignedTransaction extends EthereumTypedUnsignedTransaction {
  serialized: HexString
  derivationPath: string
  masterFingerprint: string
}

export interface EthereumTypedTransactionSignRequest extends TransactionSignRequest<SerializableEthereumTypedUnsignedTransaction> {}
