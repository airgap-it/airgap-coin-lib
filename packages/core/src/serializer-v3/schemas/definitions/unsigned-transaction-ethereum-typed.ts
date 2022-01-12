import { HexString } from './hex-string'
import { UnsignedTransaction } from './unsigned-transaction'

interface RawTypedEthereumTransaction {
  serialized: HexString
  derivationPath: string
  masterFingerprint: string
}

export interface UnsignedTypedEthereumTransaction extends UnsignedTransaction {
  transaction: RawTypedEthereumTransaction
}
