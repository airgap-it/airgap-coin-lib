// import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
// import { RawTezosTransaction } from '../types'
import { SignedCosmosTransaction, UnsignedCosmosTransaction } from '@airgap/cosmos'

import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'

// const unsignedTransactionConstraints = {
//   binaryTransaction: {
//     isValidTezosUnsignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }
// const success = () => undefined
// const error = errors => errors

// const signedTransactionConstraints = {
//   transaction: {
//     isValidTezosSignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   },
//   accountIdentifier: {
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }

// TODO implement this
export class CosmosTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedCosmosTransaction): Promise<any> {
    // const rawTx: RawTezosTransaction = unsignedTx.transaction
    validateSyncScheme({})

    return undefined // async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public async validateSignedTransaction(signedTx: SignedCosmosTransaction): Promise<any> {
    return undefined // async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
