import { SignedTransaction } from './../signed-transaction.serializer'
import { UnsignedTransaction } from '../unsigned-transaction.serializer'
export abstract class TransactionValidator {
  public abstract validateUnsignedTransaction(transaction: UnsignedTransaction): Promise<boolean>
  public abstract validateSignedTransaction(transaction: SignedTransaction): Promise<boolean> // TODO: SignedTransaction
}
