import { IAirGapSignedTransaction } from '../../../interfaces/IAirGapSignedTransaction'

import { SignedTransaction } from './transaction-sign-response'

export interface SignedCosmosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}
