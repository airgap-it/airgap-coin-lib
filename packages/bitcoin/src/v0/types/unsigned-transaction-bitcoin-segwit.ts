import { UnsignedTransaction } from '@airgap/coinlib-core/types/unsigned-transaction'
import { RawBitcoinSegwitTransaction } from './transaction-bitcoin'

export interface UnsignedBitcoinSegwitTransaction extends UnsignedTransaction {
  transaction: RawBitcoinSegwitTransaction // PSBT
  publicKey: string
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
