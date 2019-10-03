import { IACProtocol } from './inter-app-communication-protocol'
import { IACMessageType } from './interfaces'
import { IACMessageDefinition } from './message'

const accountShareResponse = require('./schemas/account-share-response.json')

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
    if (messages.every(message => Serializer.getSchema(message.type.toString()))) {
      const iacps = IACProtocol.create(messages, chunkSize)
      console.log('iacps', iacps)
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
