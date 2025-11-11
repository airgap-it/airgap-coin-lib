import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import {
  acurastSignedTransactionToResponse,
  acurastTransactionSignRequestToUnsigned,
  acurastTransactionSignResponseToSigned,
  acurastUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { AcurastTransactionValidator } from './validators/transaction-validator'
import { acurastValidators } from './validators/validators'

const acurastTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-acurast.json')
const acurastTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-acurast.json')

export class AcurastV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: acurastTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ACURAST
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: acurastTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ACURAST
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: acurastTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ACURAST_CANARY
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: acurastTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ACURAST_CANARY
    }
  ]

  private readonly acurastTransactionValidator: AcurastTransactionValidator = new AcurastTransactionValidator()

  public constructor() {
    Object.keys(acurastValidators).forEach((key: string) => {
      validators[key] = acurastValidators[key as keyof typeof acurastValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      return acurastUnsignedTransactionToRequest(unsignedTransaction as SubstrateUnsignedTransaction, publicKey, callbackUrl)
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      return acurastTransactionSignRequestToUnsigned(transactionSignRequest)
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      try {
        await this.acurastTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

        return true
      } catch {
        return false
      }
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      return acurastSignedTransactionToResponse(signedTransaction as SubstrateSignedTransaction, accountIdentifier)
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      return acurastTransactionSignResponseToSigned(transactionSignResponse)
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    if (identifier === MainProtocolSymbols.ACURAST || identifier === MainProtocolSymbols.ACURAST_CANARY) {
      try {
        await this.acurastTransactionValidator.validateSignedTransaction(transactionSignResponse)

        return true
      } catch {
        return false
      }
    } else {
      throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }
}
