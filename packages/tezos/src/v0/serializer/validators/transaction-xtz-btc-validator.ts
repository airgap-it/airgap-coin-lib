// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import {
  TransactionValidator,
  TransactionValidatorFactory,
  TransactionValidatorFactoryV2,
  TransactionValidatorV2,
  validateSyncScheme,
  validateSyncSchemeV2
} from '@airgap/serializer'

import { TezosBTC } from '../../protocol/fa/TezosBTC'
import { TezosTransactionOperation } from '../../protocol/types/operations/Transaction'
import { SignedTezosTransaction } from '../../types/signed-transaction-tezos'
import { RawTezosTransaction } from '../../types/transaction-tezos'
import { UnsignedTezosTransaction } from '../../types/unsigned-transaction-tezos'

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

export class TezosBTCTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const protocol = new TezosBTC()
      const unforged = await protocol.unforgeUnsignedTezosWrappedOperation(unsignedTx.transaction.binaryTransaction)
      const rawTx: RawTezosTransaction = unsignedTx.transaction

      if (this.version === 'v3') {
        validateSyncScheme({})
      } else {
        validateSyncSchemeV2({})
      }

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
      throw new Error(
        `the contract address for a xtz-btc transfer must be ${protocol.options.config.contractAddress}, but is ${transaction.destination}`
      )
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

export class TezosBTCTransactionValidatorFactory implements TransactionValidatorFactory<TezosBTCTransactionValidator> {
  public create(): TezosBTCTransactionValidator {
    return new TezosBTCTransactionValidator('v3')
  }
}

export class TezosBTCTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<TezosBTCTransactionValidator> {
  public create(): TezosBTCTransactionValidator {
    return new TezosBTCTransactionValidator('v2')
  }
}
