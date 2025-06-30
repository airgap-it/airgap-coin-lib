import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, validateSyncScheme } from '@airgap/serializer'

import { StellarTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-stellar'
import { StellarTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-stellar'

const unsignedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'Object',
    isValidStellarTx: true
  },
  networkId: {
    presence: { allowEmpty: false },
    type: 'String',
    isStellarNetworkId: true
  }
}

const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidStellarTx: true
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String',
    isStellarAddress: true
  }
}

const success = () => undefined
const error = (errors: any) => errors

export class StellarTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: StellarTransactionSignRequest): Promise<any> {
    validateSyncScheme({})
    return async(request, unsignedTransactionConstraints).then(success, error)
  }

  public async validateSignedTransaction(response: StellarTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }
}
