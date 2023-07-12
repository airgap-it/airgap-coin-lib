import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, validateSyncScheme } from '@airgap/serializer'

import { MinaTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-mina'
import { MinaTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-mina'

const unsignedTransactionConstraints = {
  networkType: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidMinaNetworkType: true
  },
  data: {
    presence: { allowEmpty: false },
    isValidMinaPayment: true
  }
}
const signedTransactionConstraints = {
  data: {
    presence: { allowEmpty: false },
    isValidMinaPayment: true
  },
  signature: {
    presence: { allowEmpty: false },
    isValidMinaSignature: true
  }
}

const success = () => undefined
const error = (errors) => errors

export class MinaTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: MinaTransactionSignRequest): Promise<boolean> {
    const transaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }

  public async validateSignedTransaction(response: MinaTransactionSignResponse): Promise<boolean> {
    const transaction = JSON.parse(response.transaction)
    return async(transaction, signedTransactionConstraints).then(success, error)
  }
}
