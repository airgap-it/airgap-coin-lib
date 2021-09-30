import { UnsignedTransaction } from './unsigned-transaction'

interface RawBitcoinSegwitTransaction {
  psbt: string
}

export interface UnsignedBitcoinSegwitTransaction extends UnsignedTransaction {
  transaction: RawBitcoinSegwitTransaction // PSBT
  publicKey: string
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
