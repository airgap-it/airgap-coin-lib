import {
  SubstrateSignedTransaction,
  substrateSignedTransactionToResponse,
  substrateTransactionSignRequestToUnsigned,
  substrateTransactionSignResponseToSigned,
  SubstrateUnsignedTransaction,
  substrateUnsignedTransactionToRequest
} from '@airgap/substrate/v1'

import { AstarTransactionSignRequest } from '../definitions/transaction-sign-request-astar'
import { AstarTransactionSignResponse } from '../definitions/transaction-sign-response-astar'

export function astarUnsignedTransactionToRequest(
  unsigned: SubstrateUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): AstarTransactionSignRequest {
  return substrateUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function astarSignedTransactionToResponse(
  signed: SubstrateSignedTransaction,
  accountIdentifier: string
): AstarTransactionSignResponse {
  return substrateSignedTransactionToResponse(signed, accountIdentifier)
}

export function astarTransactionSignRequestToUnsigned(request: AstarTransactionSignRequest): SubstrateUnsignedTransaction {
  return substrateTransactionSignRequestToUnsigned(request)
}

export function astarTransactionSignResponseToSigned(response: AstarTransactionSignResponse): SubstrateSignedTransaction {
  return substrateTransactionSignResponseToSigned(response)
}
