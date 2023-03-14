import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { ICPSignedTransaction, ICPUnsignedTransaction } from '../../types/transaction'

import {
  icpSignedTransactionToResponse,
  icpTransactionSignRequestToUnsigned,
  icpTransactionSignResponseToSigned,
  icpUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { ICPTransactionValidator } from './validators/transaction-validator'
import { icpValidators } from './validators/validators'

const icpTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-icp.json')
const icpTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-icp.json')

export class ICPV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: icpTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ICP
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: icpTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ICP
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: icpTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ICP_CKBTC
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: icpTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ICP_CKBTC
    }
  ]

  private readonly icpTransactionValidator: ICPTransactionValidator = new ICPTransactionValidator()

  public constructor() {
    Object.keys(icpValidators).forEach((key: string) => {
      validators[key] = icpValidators[key]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    console.log('toTransactionSignRequest : identifier', identifier)
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        return icpUnsignedTransactionToRequest(unsignedTransaction as ICPUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        return icpTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        try {
          await this.icpTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        return icpSignedTransactionToResponse(signedTransaction as ICPSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        return icpTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
      case MainProtocolSymbols.ICP_CKBTC:
        try {
          await this.icpTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.ICP, `Protocol ${identifier} not supported`)
    }
  }
}
