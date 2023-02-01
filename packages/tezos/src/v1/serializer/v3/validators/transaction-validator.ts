// tslint:disable: max-classes-per-file
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, validateSyncScheme } from '@airgap/serializer'

import { createTzBTCProtocol, TzBTCProtocol } from '../../../protocol/fa/tokens/TzBTCProtocol'
import { createTezosProtocol } from '../../../protocol/TezosProtocol'
import { TezosTransactionOperation } from '../../../types/operations/kinds/Transaction'
import { TezosTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-tezos'
import { TezosTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-tezos'

const unsignedTransactionConstraints = {
  binaryTransaction: {
    isValidTezosUnsignedTransaction: true,
    presence: { allowEmpty: false },
    type: 'String'
  }
}
const success = () => undefined
const error = (errors: any) => errors

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

export class TezosTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: TezosTransactionSignRequest): Promise<any> {
    const transaction = request.transaction
    validateSyncScheme({})

    return async(transaction, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(response: TezosTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }
}

export class TezosBTCTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: TezosTransactionSignRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const tezosProtocol = createTezosProtocol()
      const tzBTCProtocol = createTzBTCProtocol()
      const unforged = await tezosProtocol.unforgeOperation(request.transaction.binaryTransaction)
      const transaction = request.transaction

      validateSyncScheme({})

      unforged.contents.forEach(async (operation) => {
        const spendTransaction = operation as TezosTransactionOperation
        try {
          await this.assertDestination(tzBTCProtocol, spendTransaction)
          this.assertParameters(spendTransaction)
          this.assertNoHiddenXTZAmount(spendTransaction)

          const errors = await async(transaction, unsignedTransactionConstraints).then(success, error)
          resolve(errors)
        } catch (error) {
          reject(error)
        }
      })
      const errors = await async(transaction, unsignedTransactionConstraints).then(success, error)
      resolve(errors)
    })
  }

  public validateSignedTransaction(response: TezosTransactionSignResponse): Promise<any> {
    return async(response, signedTransactionConstraints).then(success, error)
  }

  private async assertDestination(protocol: TzBTCProtocol, transaction: TezosTransactionOperation) {
    const contractAddress = await protocol.getContractAddress()
    if (transaction.destination !== contractAddress) {
      throw new Error(`the contract address for a xtz-btc transfer must be ${contractAddress}, but is ${transaction.destination}`)
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
