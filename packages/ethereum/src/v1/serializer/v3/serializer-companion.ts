import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { EthereumSignedTransaction, EthereumUnsignedTransaction } from '../../types/transaction'

import {
  ethereumSignedTransactionToResponse,
  ethereumTransactionSignRequestToUnsigned,
  ethereumTransactionSignResponseToSigned,
  ethereumUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { EthereumTransactionValidator } from './validators/transaction-validator'

const ethereumTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-ethereum.json')
const ethereumTypedTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-ethereum-typed.json')
const ethereumTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-ethereum.json')

export class EthereumV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ETH
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTypedTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.ETH
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.ETH
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: ethereumTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.ETH_ERC20
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: ethereumTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.ETH_ERC20
    }
  ]

  private readonly ethereumTransactionValidator: EthereumTransactionValidator = new EthereumTransactionValidator()

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        return ethereumUnsignedTransactionToRequest(unsignedTransaction as EthereumUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        return ethereumTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        try {
          await this.ethereumTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        return ethereumSignedTransactionToResponse(signedTransaction as EthereumSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        return ethereumTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.ETH:
      case SubProtocolSymbols.ETH_ERC20:
        try {
          await this.ethereumTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.ETHEREUM, `Protocol ${identifier} not supported`)
    }
  }
}
