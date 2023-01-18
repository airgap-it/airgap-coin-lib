import { TransactionSignRequest, TransactionSignRequestV2 } from '@airgap/serializer'

import { RawBitcoinSegwitTransaction } from './transaction-bitcoin'

export interface UnsignedBitcoinSegwitTransaction extends TransactionSignRequest, TransactionSignRequestV2 {
  transaction: RawBitcoinSegwitTransaction // PSBT
  publicKey: string
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
