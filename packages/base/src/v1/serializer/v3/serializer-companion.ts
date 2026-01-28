import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { BaseSignedTransaction, BaseUnsignedTransaction } from '../../types/transaction'

import {
  baseSignedTransactionToResponse,
  baseTransactionSignRequestToUnsigned,
  baseTransactionSignResponseToSigned,
  baseUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { BaseTransactionValidator } from './validators/transaction-validator'

const ethereumTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-base.json')
const ethereumTypedTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-base-typed.json')
const ethereumTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-base.json')

export class BaseV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BASE
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTypedTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BASE
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.BASE
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.BASE_ERC20
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.BASE_ERC20
    }
  ]

  private readonly ethereumTransactionValidator: BaseTransactionValidator = new BaseTransactionValidator()

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        return baseUnsignedTransactionToRequest(unsignedTransaction as BaseUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        return baseTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        try {
          await this.ethereumTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        return baseSignedTransactionToResponse(signedTransaction as BaseSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        return baseTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BASE:
      case SubProtocolSymbols.BASE_ERC20:
        try {
          await this.ethereumTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.BASE, `Protocol ${identifier} not supported`)
    }
  }
}
