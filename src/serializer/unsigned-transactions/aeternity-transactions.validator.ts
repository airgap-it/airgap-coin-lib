import { UnsignedAeternityTransaction, RawAeternityTransaction } from './aeternity-transactions.serializer'
import { SignedAeternityTransaction } from './../signed-transactions/aeternity-transactions.serializer'
import validate = require('validate.js')
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

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
      type: 'String',
      isValidAeternityAccount: true
    }
  },
  success = () => undefined,
  error = errors => errors

export class AeternityTransactionValidator extends TransactionValidator {
  public validateUnsignedTransaction(unsignedTx: UnsignedAeternityTransaction): any {
    const rawTx: RawAeternityTransaction = unsignedTx.transaction
    validateSyncScheme({})
    return validate(rawTx, unsignedTransactionConstraints)
  }
  public async validateSignedTransaction(signedTx: SignedAeternityTransaction): Promise<any> {
    return validate.async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
