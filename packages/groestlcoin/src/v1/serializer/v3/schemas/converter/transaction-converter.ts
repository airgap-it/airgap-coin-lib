import {
  bitcoinSignedTransactionToResponse,
  bitcoinTransactionSignRequestToUnsigned,
  bitcoinTransactionSignResponseToSigned,
  bitcoinUnsignedTransactionToRequest
} from '@airgap/bitcoin/v1'

import { GroestlcoinSignedTransaction, GroestlcoinUnsignedTransaction } from '../../../../types/transaction'
import { GroestlcoinTransactionSignRequest } from '../definitions/transaction-sign-request-groestlcoin'
import { GroestlcoinTransactionSignResponse } from '../definitions/transaction-sign-response-groestlcoin'

export function groestlcoinUnsignedTransactionToRequest(
  unsigned: GroestlcoinUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): GroestlcoinTransactionSignRequest {
  return bitcoinUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

export function groestlcoinSignedTransactionToResponse(
  signed: GroestlcoinSignedTransaction,
  accountIdentifier: string
): GroestlcoinTransactionSignResponse {
  return bitcoinSignedTransactionToResponse(signed, accountIdentifier)
}

export function groestlcoinTransactionSignRequestToUnsigned(request: GroestlcoinTransactionSignRequest): GroestlcoinUnsignedTransaction {
  return bitcoinTransactionSignRequestToUnsigned(request)
}

export function groestlcoinTransactionSignResponseToSigned(response: GroestlcoinTransactionSignResponse): GroestlcoinSignedTransaction {
  return bitcoinTransactionSignResponseToSigned(response)
}
