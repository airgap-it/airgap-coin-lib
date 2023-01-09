import { newSignedTransaction } from '@airgap/module-kit'

import { EthereumRawUnsignedTransaction, EthereumSignedTransaction, EthereumTypedUnsignedTransaction } from '../../../../types/transaction'
import { EthereumTransactionSignRequest } from '../definitions/transaction-sign-request-ethereum'
import { EthereumTypedTransactionSignRequest } from '../definitions/transaction-sign-request-ethereum-typed'
import { EthereumTransactionSignResponse } from '../definitions/transaction-sign-response-ethereum'

export function ethereumRawUnsignedTransactionToRequest(
  unsigned: EthereumRawUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): EthereumTransactionSignRequest {
  return { transaction: unsigned, publicKey, callbackURL: callbackUrl }
}

export function ethereumTypedUnsignedTransactionToRequest(
  unsigned: EthereumTypedUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): EthereumTypedTransactionSignRequest {
  return { transaction: unsigned, publicKey, callbackURL: callbackUrl }
}

export function ethereumSignedTransactionToResponse(
  signed: EthereumSignedTransaction,
  accountIdentifier: string
): EthereumTransactionSignResponse {
  return { transaction: signed.serialized, accountIdentifier }
}

export function ethereumTransactionSignRequestToRawUnsigned(request: EthereumTransactionSignRequest): EthereumRawUnsignedTransaction {
  return request.transaction
}

export function ethereumTransactionSignRequestToTypedUnsigned(
  request: EthereumTypedTransactionSignRequest
): EthereumTypedUnsignedTransaction {
  return request.transaction
}

export function ethereumTransactionSignResponseToSigned(response: EthereumTransactionSignResponse): EthereumSignedTransaction {
  return newSignedTransaction<EthereumSignedTransaction>({ serialized: response.transaction })
}
