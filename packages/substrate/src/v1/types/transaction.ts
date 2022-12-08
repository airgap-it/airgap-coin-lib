import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface SubstrateUnsignedTransaction extends UnsignedTransaction {
  encoded: string
}

export interface SubstrateSignedTransaction extends SignedTransaction {
  encoded: string
}

export interface SubstrateTransactionCursor extends TransactionCursor {
  page?: number
}
