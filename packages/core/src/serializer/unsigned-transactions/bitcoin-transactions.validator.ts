import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { SignedBitcoinTransaction } from '../schemas/definitions/signed-transaction-bitcoin'
import { UnsignedBitcoinTransaction } from '../schemas/definitions/unsigned-transaction-bitcoin'
import { RawBitcoinTransaction } from '../types'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

const unsignedTransactionConstraints = {
  ins: {
    presence: { allowEmpty: false },
    isValidBitcoinInput: true
  },
  outs: {
    presence: { allowEmpty: false },
    isValidBitcoinOutput: true
  }
}

const signedTransactionConstraints = {
  from: {
    presence: { allowEmpty: false },
    isValidBitcoinFromArray: true
  },
  amount: {
    type: 'BigNumber',
    presence: { allowEmpty: false }
  },
  fee: {
    type: 'BigNumber',
    presence: { allowEmpty: false }
  },
  accountIdentifier: {
    type: 'String',
    presence: { allowEmpty: false }
  },
  transaction: {
    isValidBitcoinTxString: true,
    type: 'String',
    presence: { allowEmpty: false }
  }
}
const success = () => undefined
const error = (errors) => errors

export class BitcoinTransactionValidator extends TransactionValidator {
  public validateUnsignedTransaction(unsignedTx: UnsignedBitcoinTransaction): Promise<any> {
    const rawBitcoinTx: RawBitcoinTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return async(rawBitcoinTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedBitcoinTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
