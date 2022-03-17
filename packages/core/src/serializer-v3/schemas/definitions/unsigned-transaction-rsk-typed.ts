import { HexString } from './hex-string'
import { UnsignedTransaction } from './unsigned-transaction'

interface RawTypedRskTransaction {
  serialized: HexString
  derivationPath: string
  masterFingerprint: string
}

export interface UnsignedTypedRskTransaction extends UnsignedTransaction {
  transaction: RawTypedRskTransaction
}
