import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageType } from './interfaces'
import { IACMessageDefinition } from './message'
import { FullPayload } from './full-payload'

// const accountShareRequest = require('./schemas/account-share-request.json')
const accountShareResponse = require('./schemas/account-share-response.json')

const messageSignRequest = require('./schemas/message-sign-request.json')
const messageSignResponse = require('./schemas/message-sign-response.json')

const signedTransactionAeternity = require('./schemas/signed-transaction-aeternity.json')
const signedTransactionBitcoin = require('./schemas/signed-transaction-bitcoin.json')
const signedTransactionEthereum = require('./schemas/signed-transaction-ethereum.json')
const signedTransactionTezos = require('./schemas/signed-transaction-tezos.json')

const unsignedTransactionAeternity = require('./schemas/unsigned-transaction-aeternity.json')
const unsignedTransactionBitcoin = require('./schemas/unsigned-transaction-bitcoin.json')
const unsignedTransactionEthereum = require('./schemas/unsigned-transaction-ethereum.json')
const unsignedTransactionTezos = require('./schemas/unsigned-transaction-tezos.json')

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  private static readonly schemas: Map<string, any> = new Map()

  constructor() {}

  public static addSchema(schemaName: string, schema: any, protocol: string = ''): void {
    const protocolSpecificSchemaName: string = `${schemaName}-${protocol}`
    if (this.schemas.has(protocolSpecificSchemaName)) {
      throw new Error(`Schema ${protocolSpecificSchemaName} already exists`)
    }
    this.schemas.set(protocolSpecificSchemaName, schema)
  }

  public static getSchema(schemaName: string, protocol: string = ''): any {
    const protocolSpecificSchemaName: string = `${schemaName}-${protocol}`

    return this.schemas.get(protocolSpecificSchemaName)
  }

  public serialize(messages: IACMessageDefinition[], chunkSize: number = 0): string[] {
    if (
      messages.every(message => {
        if (message.protocol) {
          return Serializer.getSchema(message.type.toString(), message.protocol)
        } else {
          return Serializer.getSchema(message.type.toString())
        }
      })
    ) {
      const iacps = IACProtocol.create(messages, chunkSize)
      console.log('iacps', iacps)
      return iacps.map(iac => iac.encoded())
    } else {
      throw Error('Unknown schema')
    }
  }

  public deserialize(data: string[]): IACMessageDefinition[] /* TODO: Array of messages */ { 
    const result = IACProtocol.createFromEncoded(data)

    return result
    .map(el => el.payload)
    .map(el => (el as FullPayload).asJson())
    .reduce((pv: IACMessageDefinition[], cv: IACMessageDefinition[]) => pv.concat(...cv), [] as IACMessageDefinition[])
  }
}

// Serializer.addSchema(IACMessageType.MetadataRequest.toString(), '')
// Serializer.addSchema(IACMessageType.MetadataResponse.toString(), '')

// Serializer.addSchema(IACMessageType.AccountShareRequest.toString(), accountShareRequest)
Serializer.addSchema(IACMessageType.AccountShareResponse.toString(), accountShareResponse)

Serializer.addSchema(IACMessageType.MessageSignRequest.toString(), messageSignRequest)
Serializer.addSchema(IACMessageType.MessageSignResponse.toString(), messageSignResponse)

Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionAeternity, 'ae')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionBitcoin, 'btc')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionEthereum, 'eth')
Serializer.addSchema(IACMessageType.TransactionSignRequest.toString(), unsignedTransactionTezos, 'xtz')

Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionAeternity, 'ae')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionBitcoin, 'btc')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionEthereum, 'eth')
Serializer.addSchema(IACMessageType.TransactionSignResponse.toString(), signedTransactionTezos, 'xtz')
