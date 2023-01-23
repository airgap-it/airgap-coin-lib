import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { AeternitySignedTransaction, AeternityUnsignedTransaction } from '../../types/transaction'

import {
  aeternitySignedTransactionToResponse,
  aeternityTransactionSignRequestToUnsigned,
  aeternityTransactionSignResponseToSigned,
  aeternityUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { AeternityTransactionValidator } from './validators/transaction-validator'
import { aeternityValidators } from './validators/validators'

const aeternityTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-aeternity.json')
const aeternityTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-aeternity.json')

export class AeternityV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: aeternityTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.AE
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: aeternityTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.AE
    }
  ]

  private readonly aeternityTransactionValidator: AeternityTransactionValidator = new AeternityTransactionValidator()

  public constructor() {
    Object.keys(aeternityValidators).forEach((key: string) => {
      validators[key] = aeternityValidators[key]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        return aeternityUnsignedTransactionToRequest(unsignedTransaction as AeternityUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        return aeternityTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        try {
          await this.aeternityTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        return aeternitySignedTransactionToResponse(signedTransaction as AeternitySignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        return aeternityTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        try {
          await this.aeternityTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.AETERNITY, `Protocol ${identifier} not supported`)
    }
  }
}
