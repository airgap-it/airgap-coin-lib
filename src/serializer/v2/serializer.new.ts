import { FullPayload } from './full-payload'
import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageType } from './interfaces'
import { IACMessageDefinitionObject } from './message'
import { Payload } from './payload'
import { Schema } from './schemas/schema'

// const accountShareRequest = require('./schemas/generated/account-share-request.json')
const accountShareResponse = require('./schemas/generated/account-share-response.json')

const messageSignRequest = require('./schemas/generated/message-sign-request.json')
const messageSignResponse = require('./schemas/generated/message-sign-response.json')

const signedTransactionAeternity = require('./schemas/generated/signed-transaction-aeternity.json')
const signedTransactionBitcoin = require('./schemas/generated/signed-transaction-bitcoin.json')
const signedTransactionEthereum = require('./schemas/generated/signed-transaction-ethereum.json')
const signedTransactionTezos = require('./schemas/generated/signed-transaction-tezos.json')

const unsignedTransactionAeternity = require('./schemas/generated/unsigned-transaction-aeternity.json')
const unsignedTransactionBitcoin = require('./schemas/generated/unsigned-transaction-bitcoin.json')
const unsignedTransactionEthereum = require('./schemas/generated/unsigned-transaction-ethereum.json')
const unsignedTransactionTezos = require('./schemas/generated/unsigned-transaction-tezos.json')

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  private static readonly schemas: Map<string, Schema> = new Map()

  public static addSchema(schemaName: string, schema: Schema, protocol?: string): void {
    const protocolSpecificSchemaName: string = Serializer.getSchemName(schemaName, protocol)

    if (this.schemas.has(protocolSpecificSchemaName)) {
      throw new Error(`Schema ${protocolSpecificSchemaName} already exists`)
    }
    this.schemas.set(protocolSpecificSchemaName, schema)
  }

  public static getSchema(schemaName: string, protocol?: string): Schema {
    const protocolSpecificSchemaName: string = Serializer.getSchemName(schemaName, protocol)

    // Try to get the protocol specific scheme, if it doesn't exist fall back to the generic one
    const schema: Schema | undefined = this.schemas.get(protocolSpecificSchemaName) ?? this.schemas.get(Serializer.getSchemName(schemaName))

    if (!schema) {
      throw new Error(`Schema ${protocolSpecificSchemaName} does not exist`)
    }

    return schema
  }

  private static getSchemName(schemaName: string, protocol?: string): string {
    return protocol ? `${schemaName}-${protocol}` : schemaName
  }

  public async serialize(messages: IACMessageDefinitionObject[], chunkSize: number = 0): Promise<string[]> {
    if (
      messages.every((message: IACMessageDefinitionObject) => {
        return Serializer.getSchema(message.type.toString(), message.protocol)
      })
    ) {
      const iacps: IACProtocol[] = IACProtocol.create(messages, chunkSize)

      return iacps.map((iac: IACProtocol) => iac.encoded())
    } else {
      throw Error('Unknown schema')
    }
  }

  public async deserialize(data: string[]): Promise<IACMessageDefinitionObject[]> {
    const result: IACProtocol[] = IACProtocol.createFromEncoded(data)

    return result
      .map((el: IACProtocol) => el.payload)
      .map((el: Payload) => (el as FullPayload).asJson())
      .reduce((pv: IACMessageDefinitionObject[], cv: IACMessageDefinitionObject[]) => pv.concat(...cv), [] as IACMessageDefinitionObject[])
  }
}

// Serializer.addSchema(IACMessageType.MetadataRequest.toString(), '')
// Serializer.addSchema(IACMessageType.MetadataResponse.toString(), '')

// Serializer.addSchema(IACMessageType.AccountShareRequest.toString(), accountShareRequest)
Serializer.addSchema(IACMessageType.AccountShareResponse.toString(), accountShareResponse)

Serializer.addSchema(IACMessageType.MessageSignRequest.toString(), messageSignRequest)
Serializer.addSchema(IACMessageType.MessageSignResponse.toString(), messageSignResponse)

// TODO: Make sure that we have a schema for every protocol we support
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionAeternity, 'ae')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionBitcoin, 'btc')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionBitcoin, 'grs')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionEthereum, 'eth')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionEthereum, 'eth-erc20')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionTezos, 'xtz')

Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionAeternity, 'ae')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionBitcoin, 'btc')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionBitcoin, 'grs')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionEthereum, 'eth')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionEthereum, 'eth-erc20')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionTezos, 'xtz')
