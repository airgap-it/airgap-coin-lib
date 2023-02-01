import { newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'
import { ICPSignedTransaction, ICPUnsignedTransaction } from '../../../../types/transaction'
import { ICPTransactionSignRequest } from '../definitions/transaction-sign-request-icp'
import { ICPTransactionSignResponse } from '../definitions/transaction-sign-response-icp'

export function icpUnsignedTransactionToRequest(
  unsigned: ICPUnsignedTransaction,
  publicKey: string,
  callbackUrl?: string
): ICPTransactionSignRequest {
  return { transaction: unsigned, publicKey, callbackURL: callbackUrl }
}

export function icpSignedTransactionToResponse(signed: ICPSignedTransaction, accountIdentifier: string): ICPTransactionSignResponse {
  return { transaction: signed.transaction, accountIdentifier }
}

export function icpTransactionSignRequestToUnsigned(request: ICPTransactionSignRequest): ICPUnsignedTransaction {
  return newUnsignedTransaction<ICPUnsignedTransaction>(request.transaction)
}

export function icpTransactionSignResponseToSigned(response: ICPTransactionSignResponse): ICPSignedTransaction {
  return newSignedTransaction<ICPSignedTransaction>({ transaction: response.transaction })
}
