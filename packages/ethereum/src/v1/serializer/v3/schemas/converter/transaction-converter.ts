import { implementsInterface, newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTypedUnsignedTransaction,
  EthereumUnsignedTransaction
} from '../../../../types/transaction'
import { EthereumTransactionSignRequest } from '../definitions/transaction-sign-request-ethereum'
import {
  EthereumTypedTransactionSignRequest,
  SerializableEthereumTypedUnsignedTransaction
} from '../definitions/transaction-sign-request-ethereum-typed'
import { EthereumTransactionSignResponse } from '../definitions/transaction-sign-response-ethereum'

function isEthereumTypedTransactionSignRequest(
  request: EthereumTransactionSignRequest | EthereumTypedTransactionSignRequest
): request is EthereumTypedTransactionSignRequest {
  return implementsInterface<SerializableEthereumTypedUnsignedTransaction>(request.transaction, {
    derivationPath: 'required',
    masterFingerprint: 'required',
    serialized: 'required'
  })
}

export function ethereumUnsignedTransactionToRequest(
  unsigned: EthereumUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): EthereumTransactionSignRequest | EthereumTypedTransactionSignRequest {
  return unsigned.ethereumType === 'raw'
    ? ethereumRawUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
    : ethereumTypedUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)
}

function ethereumRawUnsignedTransactionToRequest(
  unsigned: EthereumRawUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): EthereumTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

function ethereumTypedUnsignedTransactionToRequest(
  unsigned: EthereumTypedUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): EthereumTypedTransactionSignRequest {
  const { type: _, ...rest } = unsigned

  return {
    transaction: rest,
    publicKey,
    callbackURL: callbackUrl
  }
}

export function ethereumSignedTransactionToResponse(
  signed: EthereumSignedTransaction,
  accountIdentifier: string
): EthereumTransactionSignResponse {
  return { transaction: signed.serialized, accountIdentifier }
}

export function ethereumTransactionSignRequestToUnsigned(
  request: EthereumTransactionSignRequest | EthereumTypedTransactionSignRequest
): EthereumUnsignedTransaction {
  return isEthereumTypedTransactionSignRequest(request)
    ? ethereumTransactionSignRequestToTypedUnsigned(request)
    : ethereumTransactionSignRequestToRawUnsigned(request)
}

function ethereumTransactionSignRequestToRawUnsigned(request: EthereumTransactionSignRequest): EthereumRawUnsignedTransaction {
  return newUnsignedTransaction<EthereumRawUnsignedTransaction>({ ethereumType: 'raw', ...request.transaction })
}

function ethereumTransactionSignRequestToTypedUnsigned(request: EthereumTypedTransactionSignRequest): EthereumTypedUnsignedTransaction {
  return newUnsignedTransaction<EthereumTypedUnsignedTransaction>({ ethereumType: 'typed', ...request.transaction })
}

export function ethereumTransactionSignResponseToSigned(response: EthereumTransactionSignResponse): EthereumSignedTransaction {
  return newSignedTransaction<EthereumSignedTransaction>({ serialized: response.transaction })
}
