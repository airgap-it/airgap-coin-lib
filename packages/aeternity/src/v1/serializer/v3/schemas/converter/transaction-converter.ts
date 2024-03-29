import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'
import { AeternitySignedTransaction, AeternityUnsignedTransaction } from '../../../../types/transaction'
import { AeternityTransactionSignRequest } from '../definitions/transaction-sign-request-aeternity'
import { AeternityTransactionSignResponse } from '../definitions/transaction-sign-response-aeternity'

export function aeternityUnsignedTransactionToRequest(
  unsigned: AeternityUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): AeternityTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function aeternitySignedTransactionToResponse(
  signed: AeternitySignedTransaction,
  accountIdentifier: string
): AeternityTransactionSignResponse {
  return { transaction: signed.transaction, accountIdentifier }
}

export function aeternityTransactionSignRequestToUnsigned(request: AeternityTransactionSignRequest): AeternityUnsignedTransaction {
  return newUnsignedTransaction<AeternityUnsignedTransaction>(request.transaction)
}

export function aeternityTransactionSignResponseToSigned(response: AeternityTransactionSignResponse): AeternitySignedTransaction {
  return newSignedTransaction<AeternitySignedTransaction>({ transaction: response.transaction })
}
