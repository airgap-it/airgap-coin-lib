import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '../../../../types/transaction'
import { SubstrateTransactionSignRequest } from '../definitions/transaction-sign-request-substrate'
import { SubstrateTransactionSignResponse } from '../definitions/transaction-sign-response-substrate'

export function substrateUnsignedTransactionToRequest(
  unsigned: SubstrateUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): SubstrateTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function substrateSignedTransactionToResponse(
  signed: SubstrateSignedTransaction,
  accountIdentifier: string
): SubstrateTransactionSignResponse {
  return { transaction: signed.encoded, accountIdentifier }
}

export function substrateTransactionSignRequestToUnsigned(request: SubstrateTransactionSignRequest): SubstrateUnsignedTransaction {
  return newUnsignedTransaction<SubstrateUnsignedTransaction>(request.transaction)
}

export function substrateTransactionSignResponseToSigned(response: SubstrateTransactionSignResponse): SubstrateSignedTransaction {
  return newSignedTransaction<SubstrateSignedTransaction>({ encoded: response.transaction })
}
