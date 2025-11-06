import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import {
  BitcoinLegacySignedTransaction,
  BitcoinLegacyUnsignedTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  // BitcoinSignedTransaction,
  BitcoinTaprootSignedTransaction,
  BitcoinTaprootUnsignedTransaction
  // BitcoinUnsignedTransaction
} from '../../types/transaction'

import {
  bitcoinLegacySignedTransactionToResponse,
  bitcoinLegacyTransactionSignRequestToUnsigned,
  bitcoinLegacyTransactionSignResponseToSigned,
  bitcoinLegacyUnsignedTransactionToRequest,
  bitcoinSegwitSignedTransactionToResponse,
  bitcoinSegwitTransactionSignRequestToUnsigned,
  bitcoinSegwitTransactionSignResponseToSigned,
  bitcoinSegwitUnsignedTransactionToRequest,
  // bitcoinSignedTransactionToResponse,
  bitcoinTaprootSignedTransactionToResponse,
  bitcoinTaprootTransactionSignRequestToUnsigned,
  bitcoinTaprootTransactionSignResponseToSigned,
  bitcoinTaprootUnsignedTransactionToRequest
  // bitcoinTransactionSignRequestToUnsigned,
  // bitcoinTransactionSignResponseToSigned,
  // bitcoinUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { BitcoinTransactionSignResponse } from './schemas/definitions/transaction-sign-response-bitcoin'
// import { BitcoinTransactionValidator } from './validators/transaction-validator'
import { bitcoinValidators } from './validators/validators'
import { BitcoinLegacyTransactionSignResponse } from './schemas/definitions/transaction-sign-response-bitcoin-legacy'
import { BitcoinTaprootTransactionSignResponse } from './schemas/definitions/transaction-sign-response-bitcoin-taproot'

const bitcoinSegwitTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin-segwit.json')
const bitcoinSegwitTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin-segwit.json')

const bitcoinLegacyTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin-legacy.json')
const bitcoinLegacyTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin-legacy.json')

export class BitcoinV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: bitcoinLegacyTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BTC
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: bitcoinLegacyTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.BTC
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: bitcoinSegwitTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BTC_SEGWIT
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: bitcoinSegwitTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.BTC_SEGWIT
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: bitcoinSegwitTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BTC_TAPROOT
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: bitcoinSegwitTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.BTC_TAPROOT
    }
  ]

  // private readonly bitcoinTransactionValidator: BitcoinTransactionValidator = new BitcoinTransactionValidator()

  public constructor() {
    Object.keys(bitcoinValidators).forEach((key: string) => {
      validators[key] = bitcoinValidators[key]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return bitcoinLegacyUnsignedTransactionToRequest(unsignedTransaction as BitcoinLegacyUnsignedTransaction, publicKey, callbackUrl)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitUnsignedTransactionToRequest(unsignedTransaction as BitcoinSegwitUnsignedTransaction, publicKey, callbackUrl)
      case MainProtocolSymbols.BTC_TAPROOT:
        return bitcoinTaprootUnsignedTransactionToRequest(unsignedTransaction as BitcoinTaprootUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return bitcoinLegacyTransactionSignRequestToUnsigned(transactionSignRequest)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitTransactionSignRequestToUnsigned(transactionSignRequest)
      case MainProtocolSymbols.BTC_TAPROOT:
        return bitcoinTaprootTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        // try {
        //   await this.bitcoinTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

        //   return true
        // } catch {
        //   return false
        // }
        return true
      case MainProtocolSymbols.BTC_SEGWIT:
        return true
      case MainProtocolSymbols.BTC_TAPROOT:
        return true
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return bitcoinLegacySignedTransactionToResponse(signedTransaction as BitcoinLegacySignedTransaction, accountIdentifier)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitSignedTransactionToResponse(signedTransaction as BitcoinSegwitSignedTransaction, accountIdentifier)
      case MainProtocolSymbols.BTC_TAPROOT:
        return bitcoinTaprootSignedTransactionToResponse(signedTransaction as BitcoinTaprootSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return bitcoinLegacyTransactionSignResponseToSigned(transactionSignResponse as BitcoinLegacyTransactionSignResponse)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitTransactionSignResponseToSigned(transactionSignResponse as BitcoinTransactionSignResponse)
      case MainProtocolSymbols.BTC_TAPROOT:
        return bitcoinTaprootTransactionSignResponseToSigned(transactionSignResponse as BitcoinTaprootTransactionSignResponse)

      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        // try {
        //   await this.bitcoinTransactionValidator.validateSignedTransaction(transactionSignResponse as BitcoinTransactionSignResponse)

        //   return true
        // } catch {
        //   return false
        // }

        return true
      case MainProtocolSymbols.BTC_SEGWIT:
        return true
      case MainProtocolSymbols.BTC_TAPROOT:
        return true
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }
}
