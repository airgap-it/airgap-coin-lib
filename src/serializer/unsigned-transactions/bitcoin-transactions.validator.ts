import { validate } from '../../dependencies/src/validate.js-0.13.1/validate'
import { UnsignedBitcoinTransaction } from '../schemas/definitions/transaction-sign-request-bitcoin'
import { SignedBitcoinTransaction } from '../schemas/definitions/transaction-sign-response-bitcoin'
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

export class BitcoinTransactionValidator extends TransactionValidator {
  public validateUnsignedTransaction(unsignedTx: UnsignedBitcoinTransaction): any {
    const rawBitcoinTx: RawBitcoinTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return validate(rawBitcoinTx, unsignedTransactionConstraints)
  }
  public validateSignedTransaction(signedTx: SignedBitcoinTransaction): Promise<any> {
    return validate(signedTx, signedTransactionConstraints)
  }
}
