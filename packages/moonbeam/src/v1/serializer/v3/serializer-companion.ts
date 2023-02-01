import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import {
  moonbeamSignedTransactionToResponse,
  moonbeamTransactionSignRequestToUnsigned,
  moonbeamTransactionSignResponseToSigned,
  moonbeamUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { MoonbeamTransactionValidator } from './validators/transaction-validator'
import { moonbeamValidators } from './validators/validators'

const moonbeamTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-moonbeam.json')
const moonbeamTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-moonbeam.json')

export class MoonbeamV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: moonbeamTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.MOONBEAM
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: moonbeamTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.MOONBEAM
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: moonbeamTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.MOONRIVER
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: moonbeamTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.MOONRIVER
    }
  ]

  private readonly moonbeamTransactionValidator: MoonbeamTransactionValidator = new MoonbeamTransactionValidator()

  public constructor() {
    Object.keys(moonbeamValidators).forEach((key: string) => {
      validators[key] = moonbeamValidators[key as keyof typeof moonbeamValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        return moonbeamUnsignedTransactionToRequest(unsignedTransaction as SubstrateUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        return moonbeamTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        try {
          await this.moonbeamTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        return moonbeamSignedTransactionToResponse(signedTransaction as SubstrateSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        return moonbeamTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.MOONBEAM:
      case MainProtocolSymbols.MOONRIVER:
        try {
          await this.moonbeamTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }
}
