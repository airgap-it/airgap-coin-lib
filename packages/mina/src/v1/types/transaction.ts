import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

import { MinaNetworkType } from './protocol'

export interface MinaPayment {
  to: string
  from: string
  amount: string
  fee: string
  nonce: string
  memo?: string
  validUntil?: string
}

export interface MinaRawSignature {
  type: 'raw'
  value: string
}

export interface MinaLegacySignature {
  type: 'legacy'
  field: string
  scalar: string
}

export type MinaSignature = MinaRawSignature | MinaLegacySignature

export interface MinaUnsignedTransaction extends UnsignedTransaction {
  networkType: MinaNetworkType
  data: MinaPayment
}

export interface MinaSignedTransaction extends SignedTransaction {
  data: MinaPayment
  signature: MinaSignature
}

export interface MinaTransactionCursor extends TransactionCursor {
  lastDateTime?: string
}
