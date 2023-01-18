import { SignedTransaction, UnsignedTransaction } from '../types/transaction'

export function newUnsignedTransaction<T extends UnsignedTransaction>(transaction: Omit<T, 'type'>): T {
  return { ...transaction, type: 'unsigned' } as T
}

export function newSignedTransaction<T extends SignedTransaction>(transaction: Omit<T, 'type'>): T {
  return { ...transaction, type: 'signed' } as T
}
