import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'

interface RawTypedEthereumTransaction {
  serialized: string /* : HexString */
  derivationPath: string
  masterFingerprint: string
}

export interface UnsignedTypedEthereumTransaction extends UnsignedTransaction {
  transaction: RawTypedEthereumTransaction
}
