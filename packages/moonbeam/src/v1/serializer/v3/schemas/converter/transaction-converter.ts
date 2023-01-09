import {
  SubstrateSignedTransaction,
  substrateSignedTransactionToResponse,
  substrateTransactionSignRequestToUnsigned,
  substrateTransactionSignResponseToSigned,
  SubstrateUnsignedTransaction,
  substrateUnsignedTransactionToRequest
} from '@airgap/substrate/v1'

import { MoonbeamTransactionSignRequest } from '../definitions/transaction-sign-request-moonbeam'
import { MoonbeamTransactionSignResponse } from '../definitions/transaction-sign-response-moonbeam'

export function moonbeamUnsignedTransactionToRequest(
  unsigned: SubstrateUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): MoonbeamTransactionSignRequest {
  return substrateUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function moonbeamSignedTransactionToResponse(
  signed: SubstrateSignedTransaction,
  accountIdentifier: string
): MoonbeamTransactionSignResponse {
  return substrateSignedTransactionToResponse(signed, accountIdentifier)
}

export function moonbeamTransactionSignRequestToUnsigned(request: MoonbeamTransactionSignRequest): SubstrateUnsignedTransaction {
  return substrateTransactionSignRequestToUnsigned(request)
}

export function moonbeamTransactionSignResponseToSigned(response: MoonbeamTransactionSignResponse): SubstrateSignedTransaction {
  return substrateTransactionSignResponseToSigned(response)
}
