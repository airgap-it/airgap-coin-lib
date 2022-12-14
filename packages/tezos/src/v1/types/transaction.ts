import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface TezosUnsignedTransaction extends UnsignedTransaction {
  binary: string
}
export interface TezosSignedTransaction extends SignedTransaction {
  binary: string
}

export interface TezosTransactionCursor extends TransactionCursor {
  offset: number
}

export interface TezosKtTransactionCursor extends TransactionCursor {
  offsets: Record<string, number>
}
