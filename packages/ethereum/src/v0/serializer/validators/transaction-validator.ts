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
import { SignedEthereumTransaction } from '../../types/signed-transaction-ethereum'
import { RawEthereumTransaction } from '../../types/transaction-ethereum'
import { UnsignedEthereumTransaction } from '../../types/unsigned-transaction-ethereum'

const unsignedTransactionConstraints = {
  nonce: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  gasPrice: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  gasLimit: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  to: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true,
    format: {
      pattern: '^0x[a-fA-F0-9]{40}$', // Should be new EthereumProtocol().addressValidationPattern, but then there is a runtime issue because of circular dependencies
      flags: 'i',
      message: 'is not a valid ethereum address'
    }
  },
  value: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  },
  chainId: {
    presence: { allowEmpty: false },
    numericality: { noStrings: true, onlyInteger: true, greaterThanOrEqualTo: 0 }
  },
  data: {
    presence: { allowEmpty: false },
    type: 'String',
    isHexStringWithPrefix: true
  }
}

const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'String',
    isValidEthereumTransactionString: true
  }
}
const success = () => undefined
const error = (errors) => errors

export class EthereumTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  constructor(private readonly version: 'v2' | 'v3' = 'v3') {}

  public validateUnsignedTransaction(unsignedTx: UnsignedEthereumTransaction): Promise<any> {
    const rawTx: RawEthereumTransaction = unsignedTx.transaction

    if (this.version === 'v3') {
      validateSyncScheme({})
    } else {
      validateSyncSchemeV2({})
    }

    return async(rawTx, unsignedTransactionConstraints).then(success, error)
  }
  public validateSignedTransaction(signedTx: SignedEthereumTransaction): any {
    return async(signedTx, signedTransactionConstraints).then(success, error)
  }
}

export class EthereumTransactionValidatorFactory implements TransactionValidatorFactory<EthereumTransactionValidator> {
  public create(): EthereumTransactionValidator {
    return new EthereumTransactionValidator('v3')
  }
}

export class EthereumTransactionValidatorFactoryV2 implements TransactionValidatorFactoryV2<EthereumTransactionValidator> {
  public create(): EthereumTransactionValidator {
    return new EthereumTransactionValidator('v2')
  }
}
