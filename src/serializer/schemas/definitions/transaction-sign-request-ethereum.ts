import { HexString } from './hex-string'
import { UnsignedTransaction } from './transaction-sign-request'

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
