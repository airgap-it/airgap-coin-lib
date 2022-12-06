import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'

interface RawEthereumTransaction {
  nonce: string /* HexString */
  gasPrice: string /* HexString */
  gasLimit: string /* HexString */
  to: string /* HexString */
  value: string /* HexString */
  chainId: number
  data: string /* HexString */
}

export interface UnsignedEthereumTransaction extends UnsignedTransaction {
  transaction: RawEthereumTransaction
}
