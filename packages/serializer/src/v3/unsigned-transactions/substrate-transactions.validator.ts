import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { RawSubstrateTransaction, SignedSubstrateTransaction, UnsignedSubstrateTransaction } from '@airgap/substrate'

import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

const unsignedTransactionConstraints = {
  encoded: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}

const signedTransactionConstraints = {
  transaction: {
    isValidSubstrateTransaction: true,
    presence: { allowEmpty: false },
    type: 'String'
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}

const success = () => undefined
const error = (errors) => errors

export class SubstrateTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedSubstrateTransaction): Promise<any> {
    const rawTx: RawSubstrateTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }

  public async validateSignedTransaction(signedTx: SignedSubstrateTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
