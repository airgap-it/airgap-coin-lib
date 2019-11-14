import { CosmosTransaction } from '../../../protocols/cosmos/CosmosTransaction'

import { UnsignedTransaction } from './transaction-sign-request'

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: CosmosTransaction
}
