import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface ICPUnsignedTransaction extends UnsignedTransaction {
  networkId: string
  transaction: string
}

export interface ICPSignedTransaction extends SignedTransaction {
  transaction: string
}

export interface ICPTransactionCursor extends TransactionCursor {
  next: string
}
