// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, validateSyncScheme } from '@airgap/serializer'

import { SubstrateTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-substrate'
import { SubstrateTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-substrate'

const unsignedTransactionConstraints = {
  encoded: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}

const signedTransactionConstraints = {
  transaction: {
    isValidSubstrateTransaction: true,
    presence: { allowEmpty: false },
    type: 'String'
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}

const success = () => undefined
const error = (errors: any) => errors

export class SubstrateTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: SubstrateTransactionSignRequest): Promise<any> {
    const transaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }

  public async validateSignedTransaction(response: SubstrateTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }
}
