// tslint:disable: max-classes-per-file
import { BitcoinTransactionValidator } from '@airgap/bitcoin/v1'
import { TransactionValidator, TransactionValidatorFactory } from '@airgap/serializer'

export class GroestlcoinTransactionValidator extends BitcoinTransactionValidator implements TransactionValidator {}

export class GroestlcoinTransactionValidatorFactory implements TransactionValidatorFactory<GroestlcoinTransactionValidator> {
  public create(): GroestlcoinTransactionValidator {
    return new GroestlcoinTransactionValidator()
  }
}
