import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { OptimismSignedTransaction, OptimismUnsignedTransaction } from '../../types/transaction'

import {
  optimismSignedTransactionToResponse,
  optimismTransactionSignRequestToUnsigned,
  optimismTransactionSignResponseToSigned,
  optimismUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { OptimismTransactionValidator } from './validators/transaction-validator'

const ethereumTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-optimism.json')
const ethereumTypedTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-optimism-typed.json')
const ethereumTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-optimism.json')

export class OptimismV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.OPTIMISM
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTypedTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.OPTIMISM
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.OPTIMISM
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.OPTIMISM_ERC20
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.OPTIMISM_ERC20
    }
  ]

  private readonly ethereumTransactionValidator: OptimismTransactionValidator = new OptimismTransactionValidator()

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        return optimismUnsignedTransactionToRequest(unsignedTransaction as OptimismUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        return optimismTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        try {
          await this.ethereumTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        return optimismSignedTransactionToResponse(signedTransaction as OptimismSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        return optimismTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.OPTIMISM:
      case SubProtocolSymbols.OPTIMISM_ERC20:
        try {
          await this.ethereumTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.OPTIMISM, `Protocol ${identifier} not supported`)
    }
  }
}
