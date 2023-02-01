import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { GroestlcoinSignedTransaction, GroestlcoinUnsignedTransaction } from '../../types/transaction'

import {
  groestlcoinSignedTransactionToResponse,
  groestlcoinTransactionSignRequestToUnsigned,
  groestlcoinTransactionSignResponseToSigned,
  groestlcoinUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { GroestlcoinTransactionSignResponse } from './schemas/definitions/transaction-sign-response-groestlcoin'
import { GroestlcoinTransactionValidator } from './validators/transaction-validator'
import { groestlcoinValidators } from './validators/validators'

const groestlcoinTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-groestlcoin.json')
const groestlcoinTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-groestlcoin.json')

export class GroestlcoinV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: groestlcoinTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.GRS
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: groestlcoinTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.GRS
    }
  ]

  private readonly groestlcoinTransactionValidator: GroestlcoinTransactionValidator = new GroestlcoinTransactionValidator()

  public constructor() {
    Object.keys(groestlcoinValidators).forEach((key: string) => {
      validators[key] = groestlcoinValidators[key as keyof typeof groestlcoinValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        return groestlcoinUnsignedTransactionToRequest(unsignedTransaction as GroestlcoinUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        return groestlcoinTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        try {
          await this.groestlcoinTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        return groestlcoinSignedTransactionToResponse(signedTransaction as GroestlcoinSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        return groestlcoinTransactionSignResponseToSigned(transactionSignResponse as GroestlcoinTransactionSignResponse)
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        try {
          await this.groestlcoinTransactionValidator.validateSignedTransaction(
            transactionSignResponse as GroestlcoinTransactionSignResponse
          )

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported`)
    }
  }
}
