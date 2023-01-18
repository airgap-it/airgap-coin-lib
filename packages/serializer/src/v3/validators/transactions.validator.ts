import { TransactionSignRequest } from '../transactions/transaction-sign-request'
import { TransactionSignResponse } from '../transactions/transaction-sign-response'

export interface TransactionValidator {
  validateUnsignedTransaction(transaction: TransactionSignRequest): Promise<boolean>
  validateSignedTransaction(transaction: TransactionSignResponse): Promise<boolean> // TODO: SignedTransaction
}

export interface TransactionValidatorFactory<T extends TransactionValidator = TransactionValidator> {
  create(): T
}
