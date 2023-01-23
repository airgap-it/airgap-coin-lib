import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import {
  astarSignedTransactionToResponse,
  astarTransactionSignRequestToUnsigned,
  astarTransactionSignResponseToSigned,
  astarUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { AstarTransactionValidator } from './validators/transaction-validator'
import { astarValidators } from './validators/validators'

const astarTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-astar.json')
const astarTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-astar.json')

export class AstarV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: astarTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ASTAR
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: astarTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ASTAR
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: astarTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.SHIDEN
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: astarTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.SHIDEN
    }
  ]

  private readonly astarTransactionValidator: AstarTransactionValidator = new AstarTransactionValidator()

  public constructor() {
    Object.keys(astarValidators).forEach((key: string) => {
      validators[key] = astarValidators[key as keyof typeof astarValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        return astarUnsignedTransactionToRequest(unsignedTransaction as SubstrateUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        return astarTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        try {
          await this.astarTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

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
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        return astarSignedTransactionToResponse(signedTransaction as SubstrateSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        return astarTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
      case MainProtocolSymbols.SHIDEN:
        try {
          await this.astarTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }
}
