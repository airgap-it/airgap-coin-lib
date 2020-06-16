import { TezosProtocol } from '../..'
import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { TezosTransactionOperation } from '../../protocols/tezos/types/operations/Transaction'
import { TezosBTCDetails } from '../constants'
import { UnsignedTezosTransaction } from '../schemas/definitions/transaction-sign-request-tezos'
import { SignedTezosTransaction } from '../schemas/definitions/transaction-sign-response-tezos'
import { RawTezosTransaction } from '../types'
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
const error = (errors) => errors

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
      const unforged = await protocol.unforgeUnsignedTezosWrappedOperation(unsignedTx.transaction.binaryTransaction)
      const rawTx: RawTezosTransaction = unsignedTx.transaction
      validateSyncScheme({})

      unforged.contents.forEach(async (operation) => {
        const spendTransaction = operation as TezosTransactionOperation
        if (spendTransaction.destination !== TezosBTCDetails.CONTRACT_ADDRESS) {
          return reject(
            new Error(
              `the contract address for a xtz-btc transfer must be ${TezosBTCDetails.CONTRACT_ADDRESS}, but is ${spendTransaction.destination}`
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
