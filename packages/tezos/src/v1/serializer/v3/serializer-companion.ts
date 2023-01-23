import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import {
  TezosSaplingSignedTransaction,
  TezosSaplingUnsignedTransaction,
  TezosSignedTransaction,
  TezosUnsignedTransaction
} from '../../types/transaction'

import {
  tezosSaplingSignedTransactionToResponse,
  tezosSaplingTransactionSignRequestToUnsigned,
  tezosSaplingTransactionSignResponseToSigned,
  tezosSaplingUnsignedTransactionToRequest,
  tezosSignedTransactionToResponse,
  tezosTransactionSignRequestToUnsigned,
  tezosTransactionSignResponseToSigned,
  tezosUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { TezosBTCTransactionValidator, TezosTransactionValidator } from './validators/transaction-validator'
import { tezosValidators } from './validators/validators'

const tezosTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos.json')
const tezosTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-tezos.json')

const tezosSaplingTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos-sapling.json')
const tezosSaplingTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-tezos-sapling.json')

export class TezosV3SerializerCompanion implements AirGapV3SerializerCompanion {
  // TODO: set up the FA protocol schemas in a more generic way
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.XTZ
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.XTZ
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosSaplingTransactionSignRequest },
      protocolIdentifier: MainProtocolSymbols.XTZ_SHIELDED
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosSaplingTransactionSignResponse },
      protocolIdentifier: MainProtocolSymbols.XTZ_SHIELDED
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_BTC
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_BTC
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_BTC_TEZ
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_BTC_TEZ
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_CTEZ
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_CTEZ
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_DOGA
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_DOGA
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_ETHTZ
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_ETHTZ
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_KUSD
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_KUSD
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_KT
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_KT
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_PLENTY
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_PLENTY
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_QUIPU
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_QUIPU
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_SIRS
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_SIRS
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_STKR
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_STKR
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_UBTC
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_UBTC
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_UDEFI
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_UDEFI
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_USD
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_USD
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_USDT
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_USDT
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_UUSD
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_UUSD
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_W
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_W
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_WRAP
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_WRAP
    },
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: tezosTransactionSignRequest },
      protocolIdentifier: SubProtocolSymbols.XTZ_YOU
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: tezosTransactionSignResponse },
      protocolIdentifier: SubProtocolSymbols.XTZ_YOU
    }
  ]

  private readonly tezosTransactionValidator: TezosTransactionValidator = new TezosTransactionValidator()
  private readonly tezoszBTCTransactionValidator: TezosBTCTransactionValidator = new TezosBTCTransactionValidator()

  public constructor() {
    Object.keys(tezosValidators).forEach((key: string) => {
      validators[key] = tezosValidators[key as keyof typeof tezosValidators]
    })
  }

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        return tezosUnsignedTransactionToRequest(unsignedTransaction as TezosUnsignedTransaction, publicKey, callbackUrl)
      case MainProtocolSymbols.XTZ_SHIELDED:
        return tezosSaplingUnsignedTransactionToRequest(unsignedTransaction as TezosSaplingUnsignedTransaction, publicKey, callbackUrl)
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<UnsignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        return tezosTransactionSignRequestToUnsigned(transactionSignRequest)
      case MainProtocolSymbols.XTZ_SHIELDED:
        return tezosSaplingTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        try {
          await this.tezosTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      case MainProtocolSymbols.XTZ_SHIELDED:
        return true
      case SubProtocolSymbols.XTZ_BTC:
        try {
          await this.tezoszBTCTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        return tezosSignedTransactionToResponse(signedTransaction as TezosSignedTransaction, accountIdentifier)
      case MainProtocolSymbols.XTZ_SHIELDED:
        return tezosSaplingSignedTransactionToResponse(signedTransaction as TezosSaplingSignedTransaction, accountIdentifier)
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        return tezosTransactionSignResponseToSigned(transactionSignResponse)
      case MainProtocolSymbols.XTZ_SHIELDED:
        return tezosSaplingTransactionSignResponseToSigned(transactionSignResponse)
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
      case SubProtocolSymbols.XTZ_BTC_TEZ:
      case SubProtocolSymbols.XTZ_CTEZ:
      case SubProtocolSymbols.XTZ_DOGA:
      case SubProtocolSymbols.XTZ_ETHTZ:
      case SubProtocolSymbols.XTZ_KUSD:
      case SubProtocolSymbols.XTZ_KT:
      case SubProtocolSymbols.XTZ_PLENTY:
      case SubProtocolSymbols.XTZ_QUIPU:
      case SubProtocolSymbols.XTZ_SIRS:
      case SubProtocolSymbols.XTZ_STKR:
      case SubProtocolSymbols.XTZ_UBTC:
      case SubProtocolSymbols.XTZ_UDEFI:
      case SubProtocolSymbols.XTZ_USD:
      case SubProtocolSymbols.XTZ_USDT:
      case SubProtocolSymbols.XTZ_UUSD:
      case SubProtocolSymbols.XTZ_W:
      case SubProtocolSymbols.XTZ_WRAP:
      case SubProtocolSymbols.XTZ_YOU:
        try {
          await this.tezosTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      case MainProtocolSymbols.XTZ_SHIELDED:
        return true
      case SubProtocolSymbols.XTZ_BTC:
        try {
          await this.tezoszBTCTransactionValidator.validateSignedTransaction(transactionSignResponse)

          return true
        } catch {
          return false
        }
      default:
        throw new UnsupportedError(Domain.TEZOS, `Protocol ${identifier} not supported`)
    }
  }
}
