import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { StellarUnsignedTransaction, StellarSignedTransaction } from '../../../../types/transaction'
import { StellarTransactionSignRequest } from '../definitions/transaction-sign-request-stellar'
import { StellarTransactionSignResponse } from '../definitions/transaction-sign-response-stellar'

export function stellarUnsignedTransactionToRequest(
  unsigned: StellarUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): StellarTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function stellarSignedTransactionToResponse(
  signed: StellarSignedTransaction,
  accountIdentifier: string
): StellarTransactionSignResponse {
  return {
    transaction: signed.transaction,
    accountIdentifier
  }
}

export function stellarTransactionSignRequestToUnsigned(request: StellarTransactionSignRequest): StellarUnsignedTransaction {
  return newUnsignedTransaction<StellarUnsignedTransaction>(request.transaction)
}

export function stellarTransactionSignResponseToSigned(response: StellarTransactionSignResponse): StellarSignedTransaction {
  return newSignedTransaction<StellarSignedTransaction>({
    transaction: response.transaction
  })
}
