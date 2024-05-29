import {
  SubstrateSignedTransaction,
  substrateSignedTransactionToResponse,
  substrateTransactionSignRequestToUnsigned,
  substrateTransactionSignResponseToSigned,
  SubstrateUnsignedTransaction,
  substrateUnsignedTransactionToRequest
} from '@airgap/substrate/v1'

import { AcurastTransactionSignRequest } from '../definitions/transaction-sign-request-acurast'
import { AcurastTransactionSignResponse } from '../definitions/transaction-sign-response-acurast'

export function acurastUnsignedTransactionToRequest(
  unsigned: SubstrateUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): AcurastTransactionSignRequest {
  return substrateUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function acurastSignedTransactionToResponse(
  signed: SubstrateSignedTransaction,
  accountIdentifier: string
): AcurastTransactionSignResponse {
  return substrateSignedTransactionToResponse(signed, accountIdentifier)
}

export function acurastTransactionSignRequestToUnsigned(request: AcurastTransactionSignRequest): SubstrateUnsignedTransaction {
  return substrateTransactionSignRequestToUnsigned(request)
}

export function acurastTransactionSignResponseToSigned(response: AcurastTransactionSignResponse): SubstrateSignedTransaction {
  return substrateTransactionSignResponseToSigned(response)
}
