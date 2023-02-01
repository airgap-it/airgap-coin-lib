// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, validateSyncScheme } from '@airgap/serializer'

import { AeternityTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-aeternity'
import { AeternityTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-aeternity'

const unsignedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidAeternityTx: true
  },
  networkId: {
    presence: { allowEmpty: false },
    type: 'String',
    isMainNet: true
  }
}
const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidAeternityTx: true
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}
const success = () => undefined
const error = (errors) => errors

export class AeternityTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: AeternityTransactionSignRequest): Promise<any> {
    const transaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }
  public async validateSignedTransaction(response: AeternityTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }
}
