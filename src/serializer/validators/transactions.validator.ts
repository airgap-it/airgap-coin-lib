import { UnsignedTransaction } from '../schemas/definitions/transaction-sign-request'
import { SignedTransaction } from '../schemas/definitions/transaction-sign-response'

export abstract class TransactionValidator {
  public abstract validateUnsignedTransaction(transaction: UnsignedTransaction): Promise<boolean>
  public abstract validateSignedTransaction(transaction: SignedTransaction): Promise<boolean> // TODO: SignedTransaction
}
