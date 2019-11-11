import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { RawTezosTransaction } from '../types'
import { SignedTezosTransaction } from '../schemas/definitions/signed-transaction-tezos'
import { UnsignedTezosTransaction } from '../schemas/definitions/unsigned-transaction-tezos'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

const unsignedTransactionConstraints = {
  binaryTransaction: {
    isValidTezosUnsignedTransaction: true,
    presence: { allowEmpty: false },
    type: 'String'
  }
}
const success = () => undefined
const error = errors => errors

const signedTransactionConstraints = {
  transaction: {
    isValidTezosSignedTransaction: true,
    presence: { allowEmpty: false },
    type: 'String'
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}

export class TezosTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    const rawTx: RawTezosTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
