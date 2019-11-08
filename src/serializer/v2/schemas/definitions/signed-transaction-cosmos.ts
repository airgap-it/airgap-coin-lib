import { IAirGapSignedTransaction } from '../../../../interfaces/IAirGapSignedTransaction'

import { SignedTransaction } from './signed-transaction'

export interface SignedCosmosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}
