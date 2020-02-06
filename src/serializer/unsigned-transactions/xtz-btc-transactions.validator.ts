import { TezosSpendOperation } from './../../../dist/protocols/tezos/TezosProtocol.d'
import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { UnsignedTezosTransaction } from '../schemas/definitions/transaction-sign-request-tezos'
import { SignedTezosTransaction } from '../schemas/definitions/transaction-sign-response-tezos'
import { RawTezosTransaction } from '../types'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'
import { TezosProtocol } from '../..'
import { TezosBTCDetails } from '../constants'

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

export class TezosBTCTransactionValidator extends TransactionValidator {
  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const protocol = new TezosProtocol()
      const unforged = protocol.unforgeUnsignedTezosWrappedOperation(unsignedTx.transaction.binaryTransaction)
      const rawTx: RawTezosTransaction = unsignedTx.transaction
      validateSyncScheme({})

      unforged.contents.forEach(async operation => {
        const spendTransaction = operation as TezosSpendOperation
        if (spendTransaction.contractDestination !== TezosBTCDetails.CONTRACT_ADDRESS) {
          reject(
            new Error(
              `the contract address for a xtz-btc transfer must be ${TezosBTCDetails.CONTRACT_ADDRESS}, but is ${spendTransaction.contractDestination}`
            )
          )
        }
      })
      const errors = await async(rawTx, unsignedTransactionConstraints).then(success, error)
      resolve(errors)
    })
  }
  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}
