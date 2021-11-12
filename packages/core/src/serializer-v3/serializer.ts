import { SerializerError, SerializerErrorType } from '../errors'
import { CosmosTransaction } from '../protocols/cosmos/CosmosTransaction'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '../utils/ProtocolSymbols'

import { IACMessageWrapper } from './iac-message-wrapper'
import { IACMessageType } from './interfaces'
import { IACMessageDefinitionObjectV3 } from './message'
import { SerializableUnsignedCosmosTransaction } from './schemas/definitions/unsigned-transaction-cosmos'
import { SchemaInfo, SchemaRoot } from './schemas/schema'
import { AeternityTransactionValidator } from './unsigned-transactions/aeternity-transactions.validator'
import { BitcoinTransactionValidator } from './unsigned-transactions/bitcoin-transactions.validator'
import { CosmosTransactionValidator } from './unsigned-transactions/cosmos-transactions.validator'
import { EthereumTransactionValidator } from './unsigned-transactions/ethereum-transactions.validator'
import { SubstrateTransactionValidator } from './unsigned-transactions/substrate-transactions.validator'
import { TezosTransactionValidator } from './unsigned-transactions/tezos-transactions.validator'
import { TezosBTCTransactionValidator } from './unsigned-transactions/xtz-btc-transactions.validator'
import { TransactionValidator } from './validators/transactions.validator'

const accountShareResponse: SchemaRoot = require('./schemas/generated/account-share-response.json')

const messageSignRequest: SchemaRoot = require('./schemas/generated/message-sign-request.json')
const messageSignResponse: SchemaRoot = require('./schemas/generated/message-sign-response.json')

const unsignedTransactionAeternity: SchemaRoot = require('./schemas/generated/transaction-sign-request-aeternity.json')
const unsignedTransactionBitcoinSegwit: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin-segwit.json')
const unsignedTransactionBitcoin: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin.json')
const unsignedTransactionCosmos: SchemaRoot = require('./schemas/generated/transaction-sign-request-cosmos.json')
const unsignedTransactionEthereum: SchemaRoot = require('./schemas/generated/transaction-sign-request-ethereum.json')
const unsignedTransactionTezos: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos.json')
const unsignedTransactionTezosSapling: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos-sapling.json')
const unsignedTransactionSubstrate: SchemaRoot = require('./schemas/generated/transaction-sign-request-substrate.json')

const signedTransactionAeternity: SchemaRoot = require('./schemas/generated/transaction-sign-response-aeternity.json')
const signedTransactionBitcoinSegwit: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin-segwit.json')
const signedTransactionBitcoin: SchemaRoot = require('./schemas/generated/transaction-sign-response-bitcoin.json')
const signedTransactionCosmos: SchemaRoot = require('./schemas/generated/transaction-sign-response-cosmos.json')
const signedTransactionEthereum: SchemaRoot = require('./schemas/generated/transaction-sign-response-ethereum.json')
const signedTransactionTezos: SchemaRoot = require('./schemas/generated/transaction-sign-response-tezos.json')
const signedTransactionTezosSapling: SchemaRoot = require('./schemas/generated/transaction-sign-response-tezos-sapling.json')
const signedTransactionSubstrate: SchemaRoot = require('./schemas/generated/transaction-sign-response-substrate.json')

function unsignedTransactionTransformerCosmos(value: SerializableUnsignedCosmosTransaction): SerializableUnsignedCosmosTransaction {
  value.transaction = CosmosTransaction.fromJSON(value) as any

  return value
}

export class SerializerV3 {
  private static readonly schemas: Map<string, SchemaInfo> = new Map()

  public static addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    const protocolSpecificSchemaName: string = SerializerV3.getSchemaName(schemaId, protocol)

    if (this.schemas.has(protocolSpecificSchemaName)) {
      throw new SerializerError(SerializerErrorType.SCHEMA_ALREADY_EXISTS, `Schema ${protocolSpecificSchemaName} already exists`)
    }
    this.schemas.set(protocolSpecificSchemaName, schema)
  }

  public static getSchema(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo {
    const protocolSpecificSchemaName: string = SerializerV3.getSchemaName(schemaId, protocol)

    let schema: SchemaInfo | undefined
    if (this.schemas.has(protocolSpecificSchemaName)) {
      schema = this.schemas.get(protocolSpecificSchemaName)
    } else if (protocol !== undefined) {
      const split = protocol.split('-')
      // if protocol is a sub protocol and there is no schema defined for it, use the main protocol schema as the fallback
      if (split.length >= 2) {
        return this.getSchema(schemaId, split[0] as MainProtocolSymbols)
      }
    }

    // Try to get the protocol specific scheme, if it doesn't exist fall back to the generic one
    schema = schema ?? this.schemas.get(SerializerV3.getSchemaName(schemaId))

    if (!schema) {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Schema ${protocolSpecificSchemaName} does not exist`)
    }

    return schema
  }

  private static getSchemaName(schemaId: number, protocol?: ProtocolSymbols): string {
    const schemaName = `${schemaId}-${protocol}`
    if (
      (protocol !== undefined && schemaId === IACMessageType.TransactionSignRequest) ||
      schemaId === IACMessageType.TransactionSignResponse
    ) {
      const split = schemaName.split('-')
      if (split.length >= 3 && `${split[1]}-${split[2]}` === SubProtocolSymbols.ETH_ERC20) {
        return `${schemaId}-${SubProtocolSymbols.ETH_ERC20}`
      }
    }

    return protocol ? `${schemaId}-${protocol}` : schemaId.toString()
  }

  public async serialize(messages: IACMessageDefinitionObjectV3[]): Promise<string> {
    if (
      messages.every((message: IACMessageDefinitionObjectV3) => {
        return SerializerV3.getSchema(message.type, message.protocol)
      })
    ) {
      const iacps: IACMessageWrapper = IACMessageWrapper.fromDecoded(JSON.parse(JSON.stringify(messages)))

      return iacps.encoded()
    } else {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Unknown schema`)
    }
  }

  public async deserialize(data: string): Promise<IACMessageDefinitionObjectV3[]> {
    let result: IACMessageWrapper
    try {
      result = IACMessageWrapper.fromEncoded(data)
    } catch {
      throw new Error('Cannot decode data')
    }
    const deserializedIACMessageDefinitionObjects: IACMessageDefinitionObjectV3[] = result.payload.asJson()

    return deserializedIACMessageDefinitionObjects
  }

  public serializationValidatorByProtocolIdentifier(protocolIdentifier: ProtocolSymbols): TransactionValidator {
    const validators: { [key in ProtocolSymbols]?: any } = {
      // TODO: Exhaustive list?
      eth: EthereumTransactionValidator,
      btc: BitcoinTransactionValidator,
      grs: BitcoinTransactionValidator,
      ae: AeternityTransactionValidator,
      xtz: TezosTransactionValidator,
      cosmos: CosmosTransactionValidator,
      polkadot: SubstrateTransactionValidator,
      kusama: SubstrateTransactionValidator,
      'xtz-btc': TezosBTCTransactionValidator
    }

    const exactMatch = Object.keys(validators).find((protocol) => protocolIdentifier === protocol)
    const startsWith = Object.keys(validators).find((protocol) => protocolIdentifier.startsWith(protocol))
    const validator = exactMatch ? exactMatch : startsWith
    // TODO: Only use validator if it's a transaction
    // if (!validator) {
    //   throw Error(`Validator not implemented for ${protocolIdentifier}, ${exactMatch}, ${startsWith}, ${validator}`)
    // }

    return new validators[validator ?? 'eth']()
  }
}

// SerializerV3.addSchema(IACMessageType.MetadataRequest, '')
// SerializerV3.addSchema(IACMessageType.MetadataResponse, '')

// SerializerV3.addSchema(IACMessageType.AccountShareRequest, accountShareRequest)
SerializerV3.addSchema(IACMessageType.AccountShareResponse, { schema: accountShareResponse })

SerializerV3.addSchema(IACMessageType.MessageSignRequest, { schema: messageSignRequest })
SerializerV3.addSchema(IACMessageType.MessageSignResponse, { schema: messageSignResponse })

// TODO: Make sure that we have a schema for every protocol we support
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionAeternity }, MainProtocolSymbols.AE)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionBitcoinSegwit }, MainProtocolSymbols.BTC_SEGWIT)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionBitcoin }, MainProtocolSymbols.BTC)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionBitcoin }, MainProtocolSymbols.GRS)
SerializerV3.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: unsignedTransactionCosmos, transformer: unsignedTransactionTransformerCosmos },
  MainProtocolSymbols.COSMOS
)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionEthereum }, MainProtocolSymbols.ETH)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionEthereum }, SubProtocolSymbols.ETH_ERC20)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, MainProtocolSymbols.XTZ)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezosSapling }, MainProtocolSymbols.XTZ_SHIELDED)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_BTC)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_ETHTZ)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_KUSD)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_KT)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_USD)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_UUSD)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_YOU)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.POLKADOT)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.KUSAMA)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.MOONBASE)
SerializerV3.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.MOONRIVER)

SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionAeternity }, MainProtocolSymbols.AE)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionBitcoinSegwit }, MainProtocolSymbols.BTC_SEGWIT)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionBitcoin }, MainProtocolSymbols.BTC)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionBitcoin }, MainProtocolSymbols.GRS)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionCosmos }, MainProtocolSymbols.COSMOS)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionEthereum }, MainProtocolSymbols.ETH)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionEthereum }, SubProtocolSymbols.ETH_ERC20)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, MainProtocolSymbols.XTZ)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezosSapling }, MainProtocolSymbols.XTZ_SHIELDED)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_BTC)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_ETHTZ)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_KUSD)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_KT)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_USD)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_UUSD)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_YOU)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.POLKADOT)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.KUSAMA)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.MOONBASE)
SerializerV3.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.MOONRIVER)
