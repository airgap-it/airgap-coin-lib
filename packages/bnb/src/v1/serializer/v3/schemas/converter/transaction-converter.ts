import {
  ethereumSignedTransactionToResponse,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  ethereumUnsignedTransactionToRequest
} from '@airgap/ethereum/v1'

import { BnbSignedTransaction, BnbUnsignedTransaction } from '../../../../types/transaction'
import { BnbTransactionSignRequest } from '../definitions/transaction-sign-request-bnb'
import { BnbTypedTransactionSignRequest } from '../definitions/transaction-sign-request-bnb-typed'
import { BnbTransactionSignResponse } from '../definitions/transaction-sign-response-bnb'

export function bnbUnsignedTransactionToRequest(
  unsigned: BnbUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BnbTransactionSignRequest | BnbTypedTransactionSignRequest {
  return ethereumUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function bnbSignedTransactionToResponse(signed: BnbSignedTransaction, accountIdentifier: string): BnbTransactionSignResponse {
  return ethereumSignedTransactionToResponse(signed, accountIdentifier)
}

export function bnbTransactionSignRequestToUnsigned(
  request: BnbTransactionSignRequest | BnbTypedTransactionSignRequest
): BnbUnsignedTransaction {
  return ethereumTransactionSignRequestToUnsigned(request)
}

export function bnbTransactionSignResponseToSigned(response: BnbTransactionSignResponse): BnbSignedTransaction {
  return ethereumTransactionSignResponseToSigned(response)
}
