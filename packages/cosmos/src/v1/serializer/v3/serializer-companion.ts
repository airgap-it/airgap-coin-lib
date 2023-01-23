import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { CosmosSignedTransaction, CosmosUnsignedTransaction } from '../../types/transaction'

import {
  cosmosSignedTransactionToResponse,
  cosmosTransactionSignRequestToUnsigned,
  cosmosTransactionSignResponseToSigned,
  cosmosUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'

const cosmosTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-cosmos.json')
const cosmosTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-cosmos.json')

export class CosmosV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: cosmosTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.COSMOS
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: cosmosTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.COSMOS
    }
  ]

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return cosmosUnsignedTransactionToRequest(unsignedTransaction as CosmosUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return cosmosTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, _transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return true
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return cosmosSignedTransactionToResponse(signedTransaction as CosmosSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return cosmosTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, _transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return true
      default:
        throw new UnsupportedError(Domain.COSMOS, `Protocol ${identifier} not supported`)
    }
  }
}
