import { CosmosTransaction } from '../../../../protocols/cosmos/CosmosTransaction'

import { UnsignedTransaction } from './unsigned-transaction'

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: CosmosTransaction
}
