import { SerializerError, SerializerErrorType } from '../errors'
import { CosmosTransaction } from '../protocols/cosmos/CosmosTransaction'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '../utils/ProtocolSymbols'

import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageType } from './interfaces'
import { IACMessageDefinitionObject } from './message'
import { FullPayload } from './payloads/full-payload'
import { Payload } from './payloads/payload'
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
const unsignedTransactionBitcoin: SchemaRoot = require('./schemas/generated/transaction-sign-request-bitcoin.json')
const unsignedTransactionCosmos: SchemaRoot = require('./schemas/generated/transaction-sign-request-cosmos.json')
const unsignedTransactionEthereum: SchemaRoot = require('./schemas/generated/transaction-sign-request-ethereum.json')
const unsignedTransactionTezos: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos.json')
const unsignedTransactionTezosSapling: SchemaRoot = require('./schemas/generated/transaction-sign-request-tezos-sapling.json')
const unsignedTransactionSubstrate: SchemaRoot = require('./schemas/generated/transaction-sign-request-substrate.json')

const signedTransactionAeternity: SchemaRoot = require('./schemas/generated/transaction-sign-response-aeternity.json')
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

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  private static readonly schemas: Map<string, SchemaInfo> = new Map()

  public static addSchema(schemaId: number, schema: SchemaInfo, protocol?: ProtocolSymbols): void {
    const protocolSpecificSchemaName: string = Serializer.getSchemaName(schemaId, protocol)

    if (this.schemas.has(protocolSpecificSchemaName)) {
      throw new SerializerError(SerializerErrorType.SCHEMA_ALREADY_EXISTS, `Schema ${protocolSpecificSchemaName} already exists`)
    }
    this.schemas.set(protocolSpecificSchemaName, schema)
  }

  public static getSchema(schemaId: number, protocol?: ProtocolSymbols): SchemaInfo {
    const protocolSpecificSchemaName: string = Serializer.getSchemaName(schemaId, protocol)

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
    schema = schema ?? this.schemas.get(Serializer.getSchemaName(schemaId))

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

  public async serialize(
    messages: IACMessageDefinitionObject[],
    singleChunkSize: number = 0,
    multiChunkSize: number = 0
  ): Promise<string[]> {
    if (
      messages.every((message: IACMessageDefinitionObject) => {
        return Serializer.getSchema(message.type, message.protocol)
      })
    ) {
      const iacps: IACProtocol[] = IACProtocol.fromDecoded(JSON.parse(JSON.stringify(messages)), singleChunkSize, multiChunkSize)

      return iacps.map((iac: IACProtocol) => iac.encoded())
    } else {
      throw new SerializerError(SerializerErrorType.SCHEMA_DOES_NOT_EXISTS, `Unknown schema`)
    }
  }

  public async deserialize(data: string[]): Promise<IACMessageDefinitionObject[]> {
    const result: IACProtocol[] = IACProtocol.fromEncoded(data)
    const deserializedIACMessageDefinitionObjects: IACMessageDefinitionObject[] = result
      .map((el: IACProtocol) => el.payload)
      .map((el: Payload) => (el as FullPayload).asJson())
      .reduce((pv: IACMessageDefinitionObject[], cv: IACMessageDefinitionObject[]) => pv.concat(...cv), [] as IACMessageDefinitionObject[])

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

// Serializer.addSchema(IACMessageType.MetadataRequest, '')
// Serializer.addSchema(IACMessageType.MetadataResponse, '')

// Serializer.addSchema(IACMessageType.AccountShareRequest, accountShareRequest)
Serializer.addSchema(IACMessageType.AccountShareResponse, { schema: accountShareResponse })

Serializer.addSchema(IACMessageType.MessageSignRequest, { schema: messageSignRequest })
Serializer.addSchema(IACMessageType.MessageSignResponse, { schema: messageSignResponse })

// TODO: Make sure that we have a schema for every protocol we support
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionAeternity }, MainProtocolSymbols.AE)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionBitcoin }, MainProtocolSymbols.BTC)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionBitcoin }, MainProtocolSymbols.GRS)
Serializer.addSchema(
  IACMessageType.TransactionSignRequest,
  { schema: unsignedTransactionCosmos, transformer: unsignedTransactionTransformerCosmos },
  MainProtocolSymbols.COSMOS
)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionEthereum }, MainProtocolSymbols.ETH)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionEthereum }, SubProtocolSymbols.ETH_ERC20)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, MainProtocolSymbols.XTZ)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezosSapling }, MainProtocolSymbols.XTZ_SHIELDED)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_BTC)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_ETHTZ)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_KUSD)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_KT)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionTezos }, SubProtocolSymbols.XTZ_USD)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.POLKADOT)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.KUSAMA)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.MOONBASE)
Serializer.addSchema(IACMessageType.TransactionSignRequest, { schema: unsignedTransactionSubstrate }, MainProtocolSymbols.MOONRIVER)

Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionAeternity }, MainProtocolSymbols.AE)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionBitcoin }, MainProtocolSymbols.BTC)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionBitcoin }, MainProtocolSymbols.GRS)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionCosmos }, MainProtocolSymbols.COSMOS)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionEthereum }, MainProtocolSymbols.ETH)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionEthereum }, SubProtocolSymbols.ETH_ERC20)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, MainProtocolSymbols.XTZ)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezosSapling }, MainProtocolSymbols.XTZ_SHIELDED)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_BTC)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_ETHTZ)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_KUSD)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_KT)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionTezos }, SubProtocolSymbols.XTZ_USD)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.POLKADOT)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.KUSAMA)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.MOONBASE)
Serializer.addSchema(IACMessageType.TransactionSignResponse, { schema: signedTransactionSubstrate }, MainProtocolSymbols.MOONRIVER)
