import { validate } from '../../dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

import { SignedBitcoinTransaction } from './../signed-transactions/bitcoin-transactions.serializer'
import { RawBitcoinTransaction, UnsignedBitcoinTransaction } from './bitcoin-transactions.serializer'

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
    presence: { allowEmpty: false },
    isBitcoinAccount: true
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
