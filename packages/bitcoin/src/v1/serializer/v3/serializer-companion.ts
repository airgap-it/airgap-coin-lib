import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import {
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinUnsignedTransaction
} from '../../types/transaction'

import {
  bitcoinSegwitSignedTransactionToResponse,
  bitcoinSegwitTransactionSignRequestToUnsigned,
  bitcoinSegwitTransactionSignResponseToSigned,
  bitcoinSegwitUnsignedTransactionToRequest,
  bitcoinSignedTransactionToResponse,
  bitcoinTransactionSignRequestToUnsigned,
  bitcoinTransactionSignResponseToSigned,
  bitcoinUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { BitcoinTransactionSignResponse } from './schemas/definitions/transaction-sign-response-bitcoin'
import { BitcoinTransactionValidator } from './validators/transaction-validator'
import { bitcoinValidators } from './validators/validators'

const bitcoinTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin.json')
const bitcoinTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin.json')

const bitcoinSegwitTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin-segwit.json')
const bitcoinSegwitTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin-segwit.json')

export class BitcoinV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: bitcoinTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.BTC
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: bitcoinTransactionSignResponse },
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
    }
  ]

  private readonly bitcoinTransactionValidator: BitcoinTransactionValidator = new BitcoinTransactionValidator()

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
        return bitcoinUnsignedTransactionToRequest(unsignedTransaction as BitcoinUnsignedTransaction, publicKey, callbackUrl)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitUnsignedTransactionToRequest(unsignedTransaction as BitcoinSegwitUnsignedTransaction, publicKey, callbackUrl)
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
        return bitcoinTransactionSignRequestToUnsigned(transactionSignRequest)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        try {
          await this.bitcoinTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      case MainProtocolSymbols.BTC_SEGWIT:
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
        return bitcoinSignedTransactionToResponse(signedTransaction as BitcoinSignedTransaction, accountIdentifier)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitSignedTransactionToResponse(signedTransaction as BitcoinSegwitSignedTransaction, accountIdentifier)
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
        return bitcoinTransactionSignResponseToSigned(transactionSignResponse as BitcoinTransactionSignResponse)
      case MainProtocolSymbols.BTC_SEGWIT:
        return bitcoinSegwitTransactionSignResponseToSigned(transactionSignResponse as BitcoinTransactionSignResponse)
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        try {
          await this.bitcoinTransactionValidator.validateSignedTransaction(transactionSignResponse as BitcoinTransactionSignResponse)

          return true
        } catch {
          return false
        }
      case MainProtocolSymbols.BTC_SEGWIT:
        return true
      default:
        throw new UnsupportedError(Domain.BITCOIN, `Protocol ${identifier} not supported`)
    }
  }
}
