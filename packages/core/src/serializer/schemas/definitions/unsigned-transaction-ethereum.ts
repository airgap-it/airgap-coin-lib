import { HexString } from './hex-string'
import { UnsignedTransaction } from './unsigned-transaction'

interface RawEthereumTransaction {
  nonce: HexString
  gasPrice: HexString
  gasLimit: HexString
  to: HexString
  value: HexString
  chainId: number
  data: HexString
}

export interface UnsignedEthereumTransaction extends UnsignedTransaction {
  transaction: RawEthereumTransaction
}
