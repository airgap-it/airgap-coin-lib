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

export class TezosTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public async validateUnsignedTransaction(unsignedTx: UnsignedTezosTransaction): Promise<any> {
    const rawTx: RawTezosTransaction = unsignedTx.transaction

    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedTezosTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class TezosTransactionValidatorFactory implements TransactionValidatorFactory<TezosTransactionValidator> {
  public create(): TezosTransactionValidator {
    return new TezosTransactionValidator('v3')
  }
}

export class TezosTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<TezosTransactionValidator> {
  public create(): TezosTransactionValidator {
    return new TezosTransactionValidator('v2')
  }
}
