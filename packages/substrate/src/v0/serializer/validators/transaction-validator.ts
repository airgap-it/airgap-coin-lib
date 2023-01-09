// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import {
  TransactionValidator,
  TransactionValidatorFactory,
  TransactionValidatorFactoryV2,
  TransactionValidatorV2,
  validateSyncScheme,
  validateSyncSchemeV2
} from '@airgap/serializer'

import { SignedSubstrateTransaction } from '../../types/signed-transaction-substrate'
import { RawSubstrateTransaction } from '../../types/transaction-substrate'
import { UnsignedSubstrateTransaction } from '../../types/unsigned-transaction-substrate'

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

export class SubstrateTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public async validateUnsignedTransaction(unsignedTx: UnsignedSubstrateTransaction): Promise<any> {
    const rawTx: RawSubstrateTransaction = unsignedTx.transaction

    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }

  public async validateSignedTransaction(signedTx: SignedSubstrateTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class SubstrateTransactionValidatorFactory implements TransactionValidatorFactory<SubstrateTransactionValidator> {
  public create(): SubstrateTransactionValidator {
    return new SubstrateTransactionValidator('v3')
  }
}

export class SubstrateTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<SubstrateTransactionValidator> {
  public create(): SubstrateTransactionValidator {
    return new SubstrateTransactionValidator('v2')
  }
}
