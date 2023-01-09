// tslint:disable: max-classes-per-file
import { TransactionValidator, TransactionValidatorFactory } from '@airgap/serializer'
import { SubstrateTransactionValidator } from '@airgap/substrate/v1'

export class AstarTransactionValidator extends SubstrateTransactionValidator implements TransactionValidator {}

export class AstarTransactionValidatorFactory implements TransactionValidatorFactory<AstarTransactionValidator> {
  public create(): AstarTransactionValidator {
    return new AstarTransactionValidator()
  }
}
