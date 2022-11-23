import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface AeternityUnsignedTransaction extends UnsignedTransaction {
  networkId: string
  transaction: string
}

export interface AeternitySignedTransaction extends SignedTransaction {
  transaction: string
}

export interface AeternityTransactionCursor extends TransactionCursor {
  next: { [address: string]: string }
}
