import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { MinaSignedTransaction, MinaUnsignedTransaction } from '../../../../types/transaction'
import { MinaTransactionSignRequest } from '../definitions/transaction-sign-request-mina'
import { MinaTransactionSignResponse } from '../definitions/transaction-sign-response-mina'

export function minaUnsignedTransactionToRequest(
  unsigned: MinaUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): MinaTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function minaSignedTransactionToResponse(signed: MinaSignedTransaction, accountIdentifier: string): MinaTransactionSignResponse {
  return { transaction: JSON.stringify(signed), accountIdentifier }
}

export function minaTransactionSignRequestToUnsigned(request: MinaTransactionSignRequest): MinaUnsignedTransaction {
  return newUnsignedTransaction<MinaUnsignedTransaction>(request.transaction)
}

export function minaTransactionSignResponseToSigned(response: MinaTransactionSignResponse): MinaSignedTransaction {
  return newSignedTransaction<MinaSignedTransaction>(JSON.parse(response.transaction))
}
