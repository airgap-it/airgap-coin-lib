// tslint:disable: max-classes-per-file
// import { async } from '../../dependencies/src/validate.js-0.13.1/validate'
// import { RawTezosTransaction } from '../types'

import {
  TransactionValidator,
  TransactionValidatorFactory,
  TransactionValidatorFactoryV2,
  TransactionValidatorV2,
  validateSyncScheme,
  validateSyncSchemeV2
} from '@airgap/serializer'

import { SignedCosmosTransaction } from '../../types/signed-transaction-cosmos'
import { UnsignedCosmosTransaction } from '../../types/transaction-cosmos'

// const unsignedTransactionConstraints = {
//   binaryTransaction: {
//     isValidTezosUnsignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }
// const success = () => undefined
// const error = errors => errors

// const signedTransactionConstraints = {
//   transaction: {
//     isValidTezosSignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   },
//   accountIdentifier: {
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }

// TODO implement this
export class CosmosTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public async validateUnsignedTransaction(unsignedTx: UnsignedCosmosTransaction): Promise<any> {
    // const rawTx: RawTezosTransaction = unsignedTx.transaction
    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return undefined // async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public async validateSignedTransaction(signedTx: SignedCosmosTransaction): Promise<any> {
    return undefined // async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class CosmosTransactionValidatorFactory implements TransactionValidatorFactory<CosmosTransactionValidator> {
  public create(): CosmosTransactionValidator {
    return new CosmosTransactionValidator('v3')
  }
}

export class CosmosTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<CosmosTransactionValidator> {
  public create(): CosmosTransactionValidator {
    return new CosmosTransactionValidator('v2')
  }
}
