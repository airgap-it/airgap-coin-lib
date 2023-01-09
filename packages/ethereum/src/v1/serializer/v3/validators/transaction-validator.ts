// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, TransactionValidatorFactory, TransactionValidatorV2, validateSyncScheme } from '@airgap/serializer'

import { EthereumUnsignedTransaction } from '../../../types/transaction'
import { EthereumTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-ethereum'
import { EthereumTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-ethereum'

const unsignedTransactionConstraints = {
  nonce: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  gasPrice: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  gasLimit: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  to: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true,
    format: {
      pattern: '^0x[a-fA-F0-9]{40}$', // Should be new EthereumProtocol().addressValidationPattern, but then there is a runtime issue because of circular dependencies
      flags: 'i',
      message: 'is not a valid ethereum address'
    }
  },
  value: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  chainId: {
    presence: { allowEmpty: false },
    numericality: { noStrings: true, onlyInteger: true, greaterThanOrEqualTo: 0 }
  },
  data: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  }
}

const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidEthereumTransactionString: true
  }
}
const success = () => undefined
const error = (errors) => errors

export class EthereumTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  public validateUnsignedTransaction(request: EthereumTransactionSignRequest): Promise<any> {
    const transaction: EthereumUnsignedTransaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: EthereumTransactionSignResponse): any {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class EthereumTransactionValidatorFactory implements TransactionValidatorFactory<EthereumTransactionValidator> {
  public create(): EthereumTransactionValidator {
    return new EthereumTransactionValidator()
  }
}
