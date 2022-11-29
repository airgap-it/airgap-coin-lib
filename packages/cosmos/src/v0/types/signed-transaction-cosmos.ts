import { SignedTransaction } from '@airgap/coinlib-core/types/signed-transaction'
import { IAirGapSignedTransaction } from '@airgap/coinlib-core/interfaces/IAirGapSignedTransaction'

export interface SignedCosmosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}
