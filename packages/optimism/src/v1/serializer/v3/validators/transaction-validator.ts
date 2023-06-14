// tslint:disable: max-classes-per-file
import { EthereumTransactionValidator } from '@airgap/ethereum/v1'
import { TransactionValidator } from '@airgap/serializer'

export class OptimismTransactionValidator extends EthereumTransactionValidator implements TransactionValidator {}
