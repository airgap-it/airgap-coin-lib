import { newSignedTransaction } from '@airgap/module-kit'

import {
  TezosSaplingSignedTransaction,
  TezosSaplingUnsignedTransaction,
  TezosSignedTransaction,
  TezosUnsignedTransaction
} from '../../../../types/transaction'
import { TezosTransactionSignRequest } from '../definitions/transaction-sign-request-tezos'
import { TezosSaplingTransactionSignRequest } from '../definitions/transaction-sign-request-tezos-sapling'
import { TezosTransactionSignResponse } from '../definitions/transaction-sign-response-tezos'
import { TezosSaplingTransactionSignResponse } from '../definitions/transaction-sign-response-tezos-sapling'

export function tezosUnsignedTransactionToRequest(
  unsigned: TezosUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): TezosTransactionSignRequest {
  return { transaction: unsigned, publicKey, callbackURL: callbackUrl }
}

export function tezosSignedTransactionToResponse(signed: TezosSignedTransaction, accountIdentifier: string): TezosTransactionSignResponse {
  return { transaction: signed.binary, accountIdentifier }
}

export function tezosTransactionSignRequestToUnsigned(request: TezosTransactionSignRequest): TezosUnsignedTransaction {
  return request.transaction
}

export function tezosTransactionSignResponseToSigned(response: TezosTransactionSignResponse): TezosSignedTransaction {
  return newSignedTransaction<TezosSignedTransaction>({ binary: response.transaction })
}

export function tezosSaplingUnsignedTransactionToRequest(
  unsigned: TezosSaplingUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): TezosSaplingTransactionSignRequest {
  return { transaction: unsigned, publicKey, callbackURL: callbackUrl }
}

export function tezosSaplingSignedTransactionToResponse(
  signed: TezosSaplingSignedTransaction,
  accountIdentifier: string
): TezosSaplingTransactionSignResponse {
  return { transaction: signed.binary, accountIdentifier }
}

export function tezosSaplingTransactionSignRequestToUnsigned(request: TezosSaplingTransactionSignRequest): TezosSaplingUnsignedTransaction {
  return request.transaction
}

export function tezosSaplingTransactionSignResponseToSigned(response: TezosSaplingTransactionSignResponse): TezosSaplingSignedTransaction {
  return newSignedTransaction<TezosSaplingSignedTransaction>({ binary: response.transaction })
}
