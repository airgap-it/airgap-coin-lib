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

import { SignedAeternityTransaction } from '../../types/signed-transaction-aeternity'
import { RawAeternityTransaction } from '../../types/transaction-aeternity'
import { UnsignedAeternityTransaction } from '../../types/unsigned-transaction-aeternity'

const unsignedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidAeternityTx: true
  },
  networkId: {
    presence: { allowEmpty: false },
    type: 'String',
    isMainNet: true
  }
}
const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidAeternityTx: true
  },
  accountIdentifier: {
    presence: { allowEmpty: false },
    type: 'String'
  }
}
const success = () => undefined
const error = (errors) => errors

export class AeternityTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public async validateUnsignedTransaction(unsignedTx: UnsignedAeternityTransaction): Promise<any> {
    const rawTx: RawAeternityTransaction = unsignedTx.transaction

    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public async validateSignedTransaction(signedTx: SignedAeternityTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class AeternityTransactionValidatorFactory implements TransactionValidatorFactory<AeternityTransactionValidator> {
  public create(): AeternityTransactionValidator {
    return new AeternityTransactionValidator('v3')
  }
}

export class AeternityTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<AeternityTransactionValidator> {
  public create(): AeternityTransactionValidator {
    return new AeternityTransactionValidator('v2')
  }
}
