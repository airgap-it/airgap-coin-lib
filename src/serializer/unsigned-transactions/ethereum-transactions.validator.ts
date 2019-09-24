import { validate } from '../../dependencies/src/validate.js-0.13.1/validate'
import { EthereumProtocol } from '../../protocols/ethereum/EthereumProtocol'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

import { SignedEthereumTransaction } from './../signed-transactions/ethereum-transactions.serializer'
import { RawEthereumTransaction, UnsignedEthereumTransaction } from './ethereum-transactions.serializer'

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
      pattern: new EthereumProtocol().addressValidationPattern,
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
  },
  success = () => undefined,
  error = errors => errors

export class EthereumTransactionValidator extends TransactionValidator {
  public validateUnsignedTransaction(unsignedTx: UnsignedEthereumTransaction): any {
    const rawTx: RawEthereumTransaction = unsignedTx.transaction
    validateSyncScheme({})
    return validate(rawTx, unsignedTransactionConstraints)
  }
  public validateSignedTransaction(signedTx: SignedEthereumTransaction): any {
    return validate(signedTx, signedTransactionConstraints).then(success, error)
    // return undefined
  }
}
