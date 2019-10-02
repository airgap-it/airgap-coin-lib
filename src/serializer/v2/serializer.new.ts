import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageDefinition, IACMessageType } from './message'

const accountShareResponse = require('./schemas/account-share-response.json')

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  public static readonly schemas: Map<string, any> = new Map()

  constructor() {}

  public static addSchema(schemaName: string, schema: any): void {
    if (this.schemas.has(schemaName)) {
      throw new Error(`Schema ${schemaName} already exists`)
    }
    this.schemas.set(schemaName, schema)
  }

  public serialize(messages: IACMessageDefinition[], chunkSize: number = 0): string[] {
    if (messages.every(message => Serializer.schemas.get(message.type.toString()))) {
      const iacps = IACProtocol.create(messages, chunkSize)
      console.log(iacps)
      return iacps.map(iac => iac.encoded())
    } else {
      throw Error('Unknown schema')
    }
  }

  public deserialize(data: string[]): IACMessageType {
    console.log(IACProtocol.createFromEncoded(data))

    return 1
  }
}

// this.schemas.set(IACMessageType.MetadataRequest.toString(), '')
// this.schemas.set(IACMessageType.MetadataResponse.toString(), '')

// this.schemas.set(IACMessageType.AccountShareRequest.toString(), '')
Serializer.addSchema(IACMessageType.AccountShareResponse.toString(), accountShareResponse)

// this.schemas.set(IACMessageType.TransactionSignRequest.toString(), '')
// this.schemas.set(IACMessageType.TransactionSignResponse.toString(), '')

// this.schemas.set(IACMessageType.MessageSignRequest.toString(), '')
// this.schemas.set(IACMessageType.MessageSignResponse.toString(), '')
