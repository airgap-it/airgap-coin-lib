import { validate } from '../../dependencies/src/validate.js-0.13.1/validate'
import { SignedTezosTransaction } from '../signed-transactions/tezos-transactions.serializer'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

import { RawTezosTransaction, UnsignedTezosTransaction } from './tezos-transactions.serializer'

let unsignedTransactionConstraints = {
    binaryTransaction: {
      isValidTezosUnsignedTransaction: true,
      presence: { allowEmpty: false },
      type: 'String'
    }
  },
  success = () => undefined,
  error = errors => errors

let signedTransactionConstraints = {
    transaction: {
      isValidTezosSignedTransaction: true,
      presence: { allowEmpty: false },
      type: 'String'
    },
    accountIdentifier: {
      presence: { allowEmpty: false },
      type: 'String',
      isPublicKey: true
    }
  },
  success = () => undefined,
  error = errors => errors

export class TezosTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    const rawTx: RawTezosTransaction = unsignedTx.transaction
    validateSyncScheme({})
    return validate(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return validate(signedTx, signedTransactionConstraints).then(success, error)
  }
}
