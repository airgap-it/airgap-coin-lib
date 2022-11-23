import { SignedTransaction, UnsignedTransaction } from '../types/transaction'

export function unsignedTransaction<T extends UnsignedTransaction>(transaction: Omit<T, 'type'>): T {
  return { ...transaction, type: 'unsigned' } as T
}

export function signedTransaction<T extends SignedTransaction>(transaction: Omit<T, 'type'>): T {
  return { ...transaction, type: 'signed' } as T
}
