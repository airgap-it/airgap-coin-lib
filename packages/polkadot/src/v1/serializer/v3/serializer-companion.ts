import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'
import { SubstrateSignedTransaction, SubstrateUnsignedTransaction } from '@airgap/substrate/v1'

import {
  polkadotSignedTransactionToResponse,
  polkadotTransactionSignRequestToUnsigned,
  polkadotTransactionSignResponseToSigned,
  polkadotUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { PolkadotTransactionValidator } from './validators/transaction-validator'
import { polkadotValidators } from './validators/validators'

const polkadotTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-polkadot.json')
const polkadotTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-polkadot.json')

export class PolkadotV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: polkadotTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.POLKADOT
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: polkadotTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.POLKADOT
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: polkadotTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.KUSAMA
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: polkadotTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.KUSAMA
    }
  ]

  private readonly polkadotTransactionValidator: PolkadotTransactionValidator = new PolkadotTransactionValidator()

  public constructor() {
    Object.keys(polkadotValidators).forEach((key: string) => {
      validators[key] = polkadotValidators[key as keyof typeof polkadotValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        return polkadotUnsignedTransactionToRequest(unsignedTransaction as SubstrateUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        return polkadotTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        try {
          await this.polkadotTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

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
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        return polkadotSignedTransactionToResponse(signedTransaction as SubstrateSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        return polkadotTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
      case MainProtocolSymbols.KUSAMA:
        try {
          await this.polkadotTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, `Protocol ${identifier} not supported`)
    }
  }
}
