// tslint:disable: max-classes-per-file
import { BitcoinTransactionValidator } from '@airgap/bitcoin/v1'
import { TransactionValidator } from '@airgap/serializer'

export class GroestlcoinTransactionValidator extends BitcoinTransactionValidator implements TransactionValidator {}
