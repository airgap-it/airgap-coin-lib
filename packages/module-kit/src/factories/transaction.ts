import { SignedTransaction, UnsignedTransaction } from '../types/transaction'

export function unsignedTransaction<T extends UnsignedTransaction>(transaction: Omit<T, 'type'>): UnsignedTransaction {
  return { ...transaction, type: 'unsigned' }
}

export function signedTransaction<T extends SignedTransaction>(transaction: Omit<T, 'type'>): SignedTransaction {
  return { ...transaction, type: 'signed' }
}
