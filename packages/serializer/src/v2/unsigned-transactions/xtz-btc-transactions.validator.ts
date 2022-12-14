import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { CoinlibAssertionError, Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { RawTezosTransaction, SignedTezosTransaction, TezosBTC, UnsignedTezosTransaction } from '@airgap/tezos'
import { TezosTransactionOperation } from '@airgap/tezos/v0/protocol/types/operations/Transaction'

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
      throw new CoinlibAssertionError(Domain.TEZOS, 'assertDestination()', transaction.destination, protocol.options.config.contractAddress)
    }
  }

  private assertParameters(transaction: TezosTransactionOperation) {
    if (transaction.parameters?.entrypoint === undefined) {
      throw new InvalidValueError(Domain.TEZOS, 'a contract transaction for xtz-btc should have an entrypoint defined')
    }
  }

  private assertNoHiddenXTZAmount(transaction: TezosTransactionOperation) {
    if (!new BigNumber(transaction.amount).eq(0)) {
      throw new InvalidValueError(Domain.TEZOS, 'a contract call cannot have the specified amount other than 0')
    }
  }
}
