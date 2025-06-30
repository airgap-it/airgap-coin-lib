import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface StellarUnsignedTransaction extends UnsignedTransaction {
  transaction: string // Base64-encoded XDR of the unsigned transaction
}

export interface StellarSignedTransaction extends SignedTransaction {
  transaction: string
}

export interface StellarTransactionCursor extends TransactionCursor {
  next: string // Horizon paging token for transaction pagination
}

// export interface StellarTransaction {
//   encoded: string
// }
