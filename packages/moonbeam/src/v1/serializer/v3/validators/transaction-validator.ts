// tslint:disable: max-classes-per-file
import { TransactionValidator } from '@airgap/serializer'
import { SubstrateTransactionValidator } from '@airgap/substrate/v1'

export class MoonbeamTransactionValidator extends SubstrateTransactionValidator implements TransactionValidator {}
