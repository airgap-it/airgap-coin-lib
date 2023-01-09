import { SignedTransaction, UnsignedTransaction } from '@airgap/coinlib-core'

export interface TransactionValidator {
  validateUnsignedTransaction(transaction: UnsignedTransaction): Promise<boolean>
  validateSignedTransaction(transaction: SignedTransaction): Promise<boolean> // TODO: SignedTransaction
}

export interface TransactionValidatorFactory<T extends TransactionValidator = TransactionValidator> {
  create(): T
}
