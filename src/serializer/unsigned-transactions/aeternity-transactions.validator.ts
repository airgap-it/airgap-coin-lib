import { async, validate } from '../../dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

import { SignedAeternityTransaction } from './../signed-transactions/aeternity-transactions.serializer'
import { RawAeternityTransaction, UnsignedAeternityTransaction } from './aeternity-transactions.serializer'

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
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
