import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { ICPActionType, ICPSignedTransaction, ICPUnsignedTransaction } from '../../../../types/transaction'
import { ICPTransactionSignRequest } from '../definitions/transaction-sign-request-icp'
import { ICPTransactionSignResponse } from '../definitions/transaction-sign-response-icp'

export function icpUnsignedTransactionToRequest(
  unsigned: ICPUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): ICPTransactionSignRequest {
  if (unsigned.transactions.length === 1 && unsigned.transactions[0].actionType === ICPActionType.TRANSFER /* legacy */) {
    const transaction: ICPTransactionSignRequest['transaction'] = {
      networkId: '',
      transaction: unsigned.transactions[0].encoded,
      transactions: []
    }

    return { transaction, publicKey, callbackURL: callbackUrl }
  }

  const { transactions } = unsigned
  const transaction: ICPTransactionSignRequest['transaction'] = {
    networkId: '',
    transaction: '',
    transactions
  }

  return { transaction, publicKey, callbackURL: callbackUrl }
}

export function icpSignedTransactionToResponse(signed: ICPSignedTransaction, accountIdentifier: string): ICPTransactionSignResponse {
  const { type: _, ...rest } = signed

  return { transaction: JSON.stringify(rest), accountIdentifier }
}

export function icpTransactionSignRequestToUnsigned(request: ICPTransactionSignRequest): ICPUnsignedTransaction {
  if (request.transaction.transaction /* legacy */) {
    return newUnsignedTransaction<ICPUnsignedTransaction>({
      transactions: [{ actionType: ICPActionType.TRANSFER, encoded: request.transaction.transaction }]
    })
  }

  return newUnsignedTransaction<ICPUnsignedTransaction>({
    transactions: request.transaction.transactions ?? []
  })
}

export function icpTransactionSignResponseToSigned(response: ICPTransactionSignResponse): ICPSignedTransaction {
  try {
    const content = JSON.parse(response.transaction)

    return newSignedTransaction<ICPSignedTransaction>(content)
  } catch /* legacy */ {
    return newSignedTransaction<ICPSignedTransaction>({
      transactions: [{ actionType: ICPActionType.TRANSFER, encoded: response.transaction }]
    })
  }
}
