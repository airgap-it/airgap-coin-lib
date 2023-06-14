import {
  ethereumSignedTransactionToResponse,
  EthereumTransactionSignRequest,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  ethereumUnsignedTransactionToRequest
} from '@airgap/ethereum/v1'
import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { OptimismRawUnsignedTransaction, OptimismSignedTransaction, OptimismUnsignedTransaction } from '../../../../types/transaction'
import { OptimismTransactionSignRequest } from '../definitions/transaction-sign-request-optimism'
import { OptimismTypedTransactionSignRequest } from '../definitions/transaction-sign-request-optimism-typed'
import { OptimismTransactionSignResponse } from '../definitions/transaction-sign-response-optimism'

export function optimismUnsignedTransactionToRequest(
  unsigned: OptimismUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): OptimismTransactionSignRequest | OptimismTypedTransactionSignRequest {
  const ethereumAnyTransactionSignRequest = ethereumUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)

  if (unsigned.ethereumType === 'raw') {
    const ethereumTransactionSignRequest = ethereumAnyTransactionSignRequest as EthereumTransactionSignRequest
    const optimismTransactionSignRequest: OptimismTransactionSignRequest = {
      ...ethereumTransactionSignRequest,
      transaction: {
        ...ethereumTransactionSignRequest.transaction,
        l1DataFee: unsigned.l1DataFee
      }
    }

    return optimismTransactionSignRequest
  }

  return ethereumAnyTransactionSignRequest as OptimismTypedTransactionSignRequest
}

export function optimismSignedTransactionToResponse(
  signed: OptimismSignedTransaction,
  accountIdentifier: string
): OptimismTransactionSignResponse {
  return ethereumSignedTransactionToResponse(
    {
      ...signed,
      serialized: signed.l1DataFee ? JSON.stringify({ serialized: signed.serialized, l1DataFee: signed.l1DataFee }) : signed.serialized
    },
    accountIdentifier
  )
}

export function optimismTransactionSignRequestToUnsigned(
  request: OptimismTransactionSignRequest | OptimismTypedTransactionSignRequest
): OptimismUnsignedTransaction {
  const ethereumUnsignedTransaction = ethereumTransactionSignRequestToUnsigned(request)

  if (ethereumUnsignedTransaction.ethereumType === 'raw') {
    const optimismRawRequest = request as OptimismTransactionSignRequest
    return newUnsignedTransaction<OptimismRawUnsignedTransaction>({
      ...ethereumUnsignedTransaction,
      l1DataFee: optimismRawRequest.transaction.l1DataFee
    })
  }

  return ethereumUnsignedTransaction
}

export function optimismTransactionSignResponseToSigned(response: OptimismTransactionSignResponse): OptimismSignedTransaction {
  const ethereumSignedTransaction = ethereumTransactionSignResponseToSigned(response)

  try {
    const { serialized, l1DataFee } = JSON.parse(ethereumSignedTransaction.serialized)

    return newSignedTransaction<OptimismSignedTransaction>({
      serialized,
      l1DataFee
    })
  } catch {
    return ethereumSignedTransaction
  }
}
