import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { SignedEthereumTransaction } from '../schemas/definitions/signed-transaction-ethereum'
import { UnsignedEthereumTransaction } from '../schemas/definitions/unsigned-transaction-ethereum'
import { RawEthereumTransaction } from '../types'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

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

export class EthereumTransactionValidator extends TransactionValidator {
  public validateUnsignedTransaction(unsignedTx: UnsignedEthereumTransaction): Promise<any> {
    const rawTx: RawEthereumTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedEthereumTransaction): any {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
