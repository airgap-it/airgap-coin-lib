import { SignedTransaction } from '../v2/schemas/definitions/signed-transaction'
import { UnsignedTransaction } from '../v2/schemas/definitions/unsigned-transaction'

export abstract class TransactionValidator {
  public abstract validateUnsignedTransaction(transaction: UnsignedTransaction): Promise<boolean>
  public abstract validateSignedTransaction(transaction: SignedTransaction): Promise<boolean> // TODO: SignedTransaction
}
