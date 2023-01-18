// tslint:disable: max-classes-per-file
import { TransactionValidator, TransactionValidatorFactory } from '@airgap/serializer'
import { SubstrateTransactionValidator } from '@airgap/substrate/v1'

export class MoonbeamTransactionValidator extends SubstrateTransactionValidator implements TransactionValidator {}

export class MoonbeamTransactionValidatorFactory implements TransactionValidatorFactory<MoonbeamTransactionValidator> {
  public create(): MoonbeamTransactionValidator {
    return new MoonbeamTransactionValidator()
  }
}
