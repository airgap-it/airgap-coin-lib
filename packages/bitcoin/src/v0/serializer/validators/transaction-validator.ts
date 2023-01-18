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

import { SignedBitcoinTransaction } from '../../types/signed-transaction-bitcoin'
import { RawBitcoinTransaction } from '../../types/transaction-bitcoin'
import { UnsignedBitcoinTransaction } from '../../types/unsigned-transaction-bitcoin'

const unsignedTransactionConstraints = {
  ins: {
    presence: { allowEmpty: false },
    isValidBitcoinInput: true
  },
  outs: {
    presence: { allowEmpty: false },
    isValidBitcoinOutput: true
  }
}

const signedTransactionConstraints = {
  from: {
    presence: { allowEmpty: false },
    isValidBitcoinFromArray: true
  },
  amount: {
    type: 'BigNumber',
    presence: { allowEmpty: false }
  },
  fee: {
    type: 'BigNumber',
    presence: { allowEmpty: false }
  },
  accountIdentifier: {
    type: 'String',
    presence: { allowEmpty: false }
  },
  transaction: {
    isValidBitcoinTxString: true,
    type: 'String',
    presence: { allowEmpty: false }
  }
}
const success = () => undefined
const error = (errors) => errors

export class BitcoinTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public validateUnsignedTransaction(unsignedTx: UnsignedBitcoinTransaction): Promise<any> {
    const rawBitcoinTx: RawBitcoinTransaction = unsignedTx.transaction

    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return async(rawBitcoinTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedBitcoinTransaction): Promise<any> {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class BitcoinTransactionValidatorFactory implements TransactionValidatorFactory<BitcoinTransactionValidator> {
  public create(): BitcoinTransactionValidator {
    return new BitcoinTransactionValidator('v3')
  }
}

export class BitcoinTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<BitcoinTransactionValidator> {
  public create(): BitcoinTransactionValidator {
    return new BitcoinTransactionValidator('v2')
  }
}
