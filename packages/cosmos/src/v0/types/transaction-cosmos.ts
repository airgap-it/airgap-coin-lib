import { UnsignedTransaction } from '@airgap/coinlib-core'

import { CosmosTransaction } from '../protocol/CosmosTransaction'

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: CosmosTransaction
}
