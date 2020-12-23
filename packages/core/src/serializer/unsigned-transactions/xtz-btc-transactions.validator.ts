import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
import { TezosBTC } from '../../protocols/tezos/fa/TezosBTC'
import { TezosTransactionOperation } from '../../protocols/tezos/types/operations/Transaction'
import { SignedTezosTransaction } from '../schemas/definitions/signed-transaction-tezos'
import { UnsignedTezosTransaction } from '../schemas/definitions/unsigned-transaction-tezos'
import { RawTezosTransaction } from '../types'
import { TransactionValidator } from '../validators/transactions.validator'
import { validateSyncScheme } from '../validators/validators'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

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
      const protocol = new TezosBTC()
      const unforged = await protocol.unforgeUnsignedTezosWrappedOperation(unsignedTx.transaction.binaryTransaction)
      const rawTx: RawTezosTransaction = unsignedTx.transaction
      validateSyncScheme({})

      unforged.contents.forEach(async (operation) => {
        const spendTransaction = operation as TezosTransactionOperation
        try {
          this.assertDestination(protocol, spendTransaction)
          this.assertParameters(spendTransaction)
          this.assertNoHiddenXTZAmount(spendTransaction)

          const errors = await async(rawTx, unsignedTransactionConstraints).then(success, error)
          resolve(errors)
        } catch (error) {
          reject(error)
        }
      })
      const errors = await async(rawTx, unsignedTransactionConstraints).then(success, error)
      resolve(errors)
    })
  }

  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }

  private assertDestination(protocol: TezosBTC, transaction: TezosTransactionOperation) {
    if (transaction.destination !== protocol.options.config.contractAddress) {
      throw new Error(`the contract address for a xtz-btc transfer must be ${protocol.options.config.contractAddress}, but is ${transaction.destination}`)
    }
  }

  private assertParameters(transaction: TezosTransactionOperation) {
    if (transaction.parameters?.entrypoint === undefined) {
      throw new Error('a contract transaction for xtz-btc should have an entrypoint defined')
    }
  }

  private assertNoHiddenXTZAmount(transaction: TezosTransactionOperation) {
    if (!new BigNumber(transaction.amount).eq(0)) {
      throw new Error('a contract call cannot have the specified amount other than 0')
    }
  }
}
