import {
  SubstrateSignedTransaction,
  substrateSignedTransactionToResponse,
  substrateTransactionSignRequestToUnsigned,
  substrateTransactionSignResponseToSigned,
  SubstrateUnsignedTransaction,
  substrateUnsignedTransactionToRequest
} from '@airgap/substrate/v1'

import { PolkadotTransactionSignRequest } from '../definitions/transaction-sign-request-polkadot'
import { PolkadotTransactionSignResponse } from '../definitions/transaction-sign-response-polkadot'

export function polkadotUnsignedTransactionToRequest(
  unsigned: SubstrateUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): PolkadotTransactionSignRequest {
  return substrateUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function polkadotSignedTransactionToResponse(
  signed: SubstrateSignedTransaction,
  accountIdentifier: string
): PolkadotTransactionSignResponse {
  return substrateSignedTransactionToResponse(signed, accountIdentifier)
}

export function polkadotTransactionSignRequestToUnsigned(request: PolkadotTransactionSignRequest): SubstrateUnsignedTransaction {
  return substrateTransactionSignRequestToUnsigned(request)
}

export function polkadotTransactionSignResponseToSigned(response: PolkadotTransactionSignResponse): SubstrateSignedTransaction {
  return substrateTransactionSignResponseToSigned(response)
}
