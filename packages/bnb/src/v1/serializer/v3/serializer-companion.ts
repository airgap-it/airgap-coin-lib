import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { BnbSignedTransaction, BnbUnsignedTransaction } from '../../types/transaction'

import {
  bnbSignedTransactionToResponse,
  bnbTransactionSignRequestToUnsigned,
  bnbTransactionSignResponseToSigned,
  bnbUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { BnbTransactionValidator } from './validators/transaction-validator'

const ethereumTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bnb.json')
const ethereumTypedTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bnb-typed.json')
const ethereumTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-bnb.json')

export class BnbV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BNB
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTypedTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BNB
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.BNB
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.BNB_ERC20
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.BNB_ERC20
    }
  ]

  private readonly ethereumTransactionValidator: BnbTransactionValidator = new BnbTransactionValidator()

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        return bnbUnsignedTransactionToRequest(unsignedTransaction as BnbUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        return bnbTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        try {
          await this.ethereumTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        return bnbSignedTransactionToResponse(signedTransaction as BnbSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        return bnbTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BNB:
      case SubProtocolSymbols.BNB_ERC20:
        try {
          await this.ethereumTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.BNB, `Protocol ${identifier} not supported`)
    }
  }
}
