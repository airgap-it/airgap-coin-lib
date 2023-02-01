// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, TransactionValidatorFactory, validateSyncScheme } from '@airgap/serializer'

import { ICPTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-icp'
import { ICPTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-icp'

const unsignedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidICPTx: true
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
    isValidICPTx: true
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}
const success = () => undefined
const error = (errors) => errors

export class ICPTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: ICPTransactionSignRequest): Promise<any> {
    const transaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }
  public async validateSignedTransaction(response: ICPTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }
}

export class ICPTransactionValidatorFactory implements TransactionValidatorFactory<ICPTransactionValidator> {
  public create(): ICPTransactionValidator {
    return new ICPTransactionValidator()
  }
}
