import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { CosmosSignedTransaction, CosmosUnsignedTransaction } from '../../../../types/transaction'
import { CosmosTransactionSignRequest } from '../definitions/transaction-sign-request-cosmos'
import { CosmosTransactionSignResponse } from '../definitions/transaction-sign-response-cosmos'

export function cosmosUnsignedTransactionToRequest(
  unsigned: CosmosUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): CosmosTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function cosmosSignedTransactionToResponse(
  signed: CosmosSignedTransaction,
  accountIdentifier: string
): CosmosTransactionSignResponse {
  return { transaction: signed.encoded, accountIdentifier }
}

export function cosmosTransactionSignRequestToUnsigned(request: CosmosTransactionSignRequest): CosmosUnsignedTransaction {
  return newUnsignedTransaction<CosmosUnsignedTransaction>(request.transaction)
}

export function cosmosTransactionSignResponseToSigned(response: CosmosTransactionSignResponse): CosmosSignedTransaction {
  return newSignedTransaction<CosmosSignedTransaction>({ encoded: response.transaction })
}
