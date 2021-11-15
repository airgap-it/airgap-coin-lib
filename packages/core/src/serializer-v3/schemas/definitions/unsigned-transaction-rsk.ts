import { HexString } from './hex-string'
import { UnsignedTransaction } from './unsigned-transaction'

interface RawRskTransaction {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
}

export interface UnsignedRskTransaction extends UnsignedTransaction {
  transaction: RawRskTransaction
}
