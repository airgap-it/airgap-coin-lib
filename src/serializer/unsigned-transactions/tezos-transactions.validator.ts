import { UnsignedTezosTransaction, RawTezosTransaction } from './tezos-transactions.serializer'
import validate = require('validate.js')
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'
import { SignedTezosTransaction } from '../signed-transactions/tezos-transactions.serializer'

var unsignedTransactionConstraints = {
    binaryTransaction: {
      isValidTezosUnsignedTransaction: true,
      presence: { allowEmpty: false },
      type: 'String'
    }
  },
  success = () => undefined,
  error = errors => errors

var signedTransactionConstraints = {
    transaction: {
      isValidTezosSignedTransaction: true,
      presence: { allowEmpty: false },
      type: 'String'
    },
    accountIdentifier: {
      presence: { allowEmpty: false },
      type: 'String'
    }
  },
  success = () => undefined,
  error = errors => errors

export class TezosTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    const rawTx: RawTezosTransaction = unsignedTx.transaction
    validateSyncScheme({})
    return validate.async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return validate.async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
