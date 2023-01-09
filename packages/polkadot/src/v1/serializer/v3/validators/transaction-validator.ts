// tslint:disable: max-classes-per-file
import { TransactionValidator, TransactionValidatorFactory } from '@airgap/serializer'
import { SubstrateTransactionValidator } from '@airgap/substrate/v1'

export class PolkadotTransactionValidator extends SubstrateTransactionValidator implements TransactionValidator {}

export class PolkadotTransactionValidatorFactory implements TransactionValidatorFactory<PolkadotTransactionValidator> {
  public create(): PolkadotTransactionValidator {
    return new PolkadotTransactionValidator()
  }
}
