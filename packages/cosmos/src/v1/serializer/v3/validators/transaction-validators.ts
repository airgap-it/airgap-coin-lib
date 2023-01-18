// tslint:disable: max-classes-per-file
// import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TransactionValidator, TransactionValidatorFactory, validateSyncScheme } from '@airgap/serializer'

// import { CosmosUnsignedTransaction } from '../../../types/transaction'
import { CosmosTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-cosmos'
import { CosmosTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-cosmos'

// const unsignedTransactionConstraints = {
//   binaryTransaction: {
//     isValidCosmosUnsignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }
// const success = () => undefined
// const error = errors => errors

// const signedTransactionConstraints = {
//   transaction: {
//     isValidCosmosSignedTransaction: true,
//     presence: { allowEmpty: false },
//     type: 'String'
//   },
//   accountIdentifier: {
//     presence: { allowEmpty: false },
//     type: 'String'
//   }
// }

// TODO implement this
export class CosmosTransactionValidator implements TransactionValidator {
  public async validateUnsignedTransaction(request: CosmosTransactionSignRequest): Promise<any> {
    // const transaction: CosmosUnsignedTransaction = request.transaction
    validateSyncScheme({})

    // return async(transaction, unsignedTransactionConstraints).then(success, error)
    return undefined
  }
  public async validateSignedTransaction(response: CosmosTransactionSignResponse): Promise<any> {
    // return async(response, signedTransactionConstraints).then(success, error)
    return undefined
  }
}

export class CosmosTransactionValidatorFactory implements TransactionValidatorFactory<CosmosTransactionValidator> {
  public create(): CosmosTransactionValidator {
    return new CosmosTransactionValidator()
  }
}
