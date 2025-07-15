import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { IACMessageType, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'

import {
  stellarUnsignedTransactionToRequest,
  stellarTransactionSignRequestToUnsigned,
  stellarSignedTransactionToResponse,
  stellarTransactionSignResponseToSigned
} from './schemas/converter/transaction-converter'
import { StellarTransactionValidator } from './validators/transaction-validator'
import { stellarValidators } from './validators/validators'

// import { StellarTransactionSignRequest } from './schemas/definitions/transaction-sign-request-stellar'
// import { StellarTransactionSignResponse } from './schemas/definitions/transaction-sign-response-stellar'

const stellarTransactionSignRequestSchema: any = require('./schemas/generated/transaction-sign-request-stellar.json')
const stellarTransactionSignResponseSchema: any = require('./schemas/generated/transaction-sign-response-stellar.json')

export class StellarV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: stellarTransactionSignRequestSchema },
      protocolIdentifier: MainProtocolSymbols.STELLAR
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: stellarTransactionSignResponseSchema },
      protocolIdentifier: MainProtocolSymbols.STELLAR
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: stellarTransactionSignRequestSchema },
      protocolIdentifier: SubProtocolSymbols.STELLAR_ASSET
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: stellarTransactionSignResponseSchema },
      protocolIdentifier: SubProtocolSymbols.STELLAR_ASSET
    }
  ]

  private readonly stellarTransactionValidator = new StellarTransactionValidator()

  constructor() {
    // Register custom validators globally
    Object.keys(stellarValidators).forEach((key: string) => {
      validators[key] = stellarValidators[key]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      return stellarUnsignedTransactionToRequest(unsignedTransaction as any, publicKey, callbackUrl)
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      return stellarTransactionSignRequestToUnsigned(transactionSignRequest)
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      try {
        await this.stellarTransactionValidator.validateUnsignedTransaction(transactionSignRequest)
        return true
      } catch {
        return false
      }
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      return stellarSignedTransactionToResponse(signedTransaction as any, accountIdentifier)
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      return stellarTransactionSignResponseToSigned(transactionSignResponse)
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    if (identifier === MainProtocolSymbols.STELLAR || SubProtocolSymbols.STELLAR_ASSET) {
      try {
        await this.stellarTransactionValidator.validateSignedTransaction(transactionSignResponse)
        return true
      } catch {
        return false
      }
    }

    throw new UnsupportedError(Domain.STELLAR, `Protocol ${identifier} not supported`)
  }
}
