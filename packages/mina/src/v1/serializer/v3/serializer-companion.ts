import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction, V3SchemaConfiguration } from '@airgap/module-kit'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { MinaSignedTransaction, MinaUnsignedTransaction } from '../../types/transaction'

import {
  minaSignedTransactionToResponse,
  minaTransactionSignRequestToUnsigned,
  minaTransactionSignResponseToSigned,
  minaUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { MinaTransactionValidator } from './validators/transaction-validator'
import { minaValidators } from './validators/validators'

const minaTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-mina.json')
const minaTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-mina.json')

export class MinaV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: minaTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.MINA
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: minaTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.MINA
    }
  ]

  private readonly minaTransactionValidator: MinaTransactionValidator = new MinaTransactionValidator()

  public constructor() {
    Object.keys(minaValidators).forEach((key: string) => {
      validators[key] = minaValidators[key]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        return minaUnsignedTransactionToRequest(unsignedTransaction as MinaUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        return minaTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        try {
          await this.minaTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        return minaSignedTransactionToResponse(signedTransaction as MinaSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        return minaTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        try {
          await this.minaTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.MINA, `Protocol ${identifier} not supported`)
    }
  }
}
