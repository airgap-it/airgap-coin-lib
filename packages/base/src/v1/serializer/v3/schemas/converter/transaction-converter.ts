import {
  ethereumSignedTransactionToResponse,
  EthereumTransactionSignRequest,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  ethereumUnsignedTransactionToRequest
} from '@airgap/ethereum/v1'
import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { BaseRawUnsignedTransaction, BaseSignedTransaction, BaseUnsignedTransaction } from '../../../../types/transaction'
import { BaseTransactionSignRequest } from '../definitions/transaction-sign-request-base'
import { BaseTypedTransactionSignRequest } from '../definitions/transaction-sign-request-base-typed'
import { BaseTransactionSignResponse } from '../definitions/transaction-sign-response-base'

export function baseUnsignedTransactionToRequest(
  unsigned: BaseUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): BaseTransactionSignRequest | BaseTypedTransactionSignRequest {
  const ethereumAnyTransactionSignRequest = ethereumUnsignedTransactionToRequest(unsigned, publicKey, callbackUrl)

  if (unsigned.ethereumType === 'raw') {
    const ethereumTransactionSignRequest = ethereumAnyTransactionSignRequest as EthereumTransactionSignRequest
    const baseTransactionSignRequest: BaseTransactionSignRequest = {
      ...ethereumTransactionSignRequest,
      transaction: {
        ...ethereumTransactionSignRequest.transaction,
        l1DataFee: unsigned.l1DataFee
      }
    }

    return baseTransactionSignRequest
  }

  return ethereumAnyTransactionSignRequest as BaseTypedTransactionSignRequest
}

export function baseSignedTransactionToResponse(signed: BaseSignedTransaction, accountIdentifier: string): BaseTransactionSignResponse {
  return ethereumSignedTransactionToResponse(
    {
      ...signed,
      serialized: signed.l1DataFee ? JSON.stringify({ serialized: signed.serialized, l1DataFee: signed.l1DataFee }) : signed.serialized
    },
    accountIdentifier
  )
}

export function baseTransactionSignRequestToUnsigned(
  request: BaseTransactionSignRequest | BaseTypedTransactionSignRequest
): BaseUnsignedTransaction {
  const ethereumUnsignedTransaction = ethereumTransactionSignRequestToUnsigned(request)

  if (ethereumUnsignedTransaction.ethereumType === 'raw') {
    const baseRawRequest = request as BaseTransactionSignRequest
    return newUnsignedTransaction<BaseRawUnsignedTransaction>({
      ...ethereumUnsignedTransaction,
      l1DataFee: baseRawRequest.transaction.l1DataFee
    })
  }

  return ethereumUnsignedTransaction
}

export function baseTransactionSignResponseToSigned(response: BaseTransactionSignResponse): BaseSignedTransaction {
  const ethereumSignedTransaction = ethereumTransactionSignResponseToSigned(response)

  try {
    const { serialized, l1DataFee } = JSON.parse(ethereumSignedTransaction.serialized)

    return newSignedTransaction<BaseSignedTransaction>({
      serialized,
      l1DataFee
    })
  } catch {
    return ethereumSignedTransaction
  }
}
