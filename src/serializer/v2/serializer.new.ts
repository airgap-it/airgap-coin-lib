import * as bs58check from 'bs58check'
import * as rlp from 'rlp'

import { jsonToArray, rlpArrayToJson, unwrapSchema } from '../json-to-rlp/json-to-rlp'

import { AccountShareResponse } from './schemas/account-share-response'
import { MessageSignRequest } from './schemas/message-sign-request'
import { MessageSignResponse } from './schemas/message-sign-response'

const accountShareResponse = require('./schemas/account-share-response.json')

type IACMessages = AccountShareResponse | MessageSignRequest | MessageSignResponse

interface IACMessageDefinition {
  type: IACMessageType
  data: IACMessages
  schema?: any
}

// tslint:disable:max-classes-per-file
export enum IACMessageType {
  MetadataRequest = 1,
  MetadataResponse = 2,
  AccountShareRequest = 3,
  AccountShareResponse = 4,
  TransactionSignRequest = 5,
  TransactionSignResponse = 6,
  MessageSignRequest = 7,
  MessageSignResponse = 8
}

export enum IACPayloadType {
  FULL = 0,
  CHUNKED = 1
}

export class Serializer {
  private readonly schemas: Map<string, any> = new Map()

  constructor() {
    // this.schemas.set(IACMessageType.MetadataRequest.toString(), '')
    // this.schemas.set(IACMessageType.MetadataResponse.toString(), '')

    // this.schemas.set(IACMessageType.AccountShareRequest.toString(), '')
    this.addSchema(IACMessageType.AccountShareResponse.toString(), accountShareResponse)

    // this.schemas.set(IACMessageType.TransactionSignRequest.toString(), '')
    // this.schemas.set(IACMessageType.TransactionSignResponse.toString(), '')

    // this.schemas.set(IACMessageType.MessageSignRequest.toString(), '')
    // this.schemas.set(IACMessageType.MessageSignResponse.toString(), '')
  }

  public addSchema(schemaName: string, schema: any): void {
    if (this.schemas.has(schemaName)) {
      throw new Error(`Schema ${schemaName} already exists`)
    }
    this.schemas.set(schemaName, schema)
  }

  public serialize(messages: IACMessageDefinition[], chunkSize: number = 0): string[] {
    messages.forEach(message => (message.schema = this.schemas.get(message.type.toString())))

    if (messages.every(message => message.schema)) {
      const iacps = IACProtocol.create(messages, chunkSize)
      console.log(iacps)
      return iacps.map(iac => iac.encoded())
    } else {
      throw Error('Unknown schema')
    }
  }

  public deserialize(data: string[]): IACMessageType {
    IACProtocol.createFromEncoded(data)

    return 1
  }
}

class Message {
  private version: string = '0'
  public type: number
  private schema: Object
  private protocol: string
  private data: any

  constructor(messageType: number | Buffer, schema: Object, protocol: string, data: any) {
    if (typeof messageType === 'number') {
      this.type = messageType
      this.schema = schema
      this.protocol = protocol
      this.data = data
    } else {
      console.log('messageType', messageType[0])
      this.version = messageType[0][0].toString()
      this.type = parseInt(messageType[0][1].toString(), 10)
      this.protocol = messageType[0][2].toString()
      this.schema = unwrapSchema(accountShareResponse) // TODO: Select schema according to protocol
      console.log('decoded message', this.version, this.type, this.protocol, messageType[0][3])
      this.data = rlpArrayToJson((this.schema as any).properties, messageType[0][3] as any)
    }
  }

  public asArray(): string[] {
    const array = jsonToArray('root', unwrapSchema(this.schema), this.data)
    console.log(array)
    return [this.version /* TODO Set value */, this.type.toString(), this.protocol, array]
  }
}

interface Payload {
  asArray(): string[]
}

class ChunkedPayload implements Payload {
  public currentPage: number
  public total: number
  public buffer: Buffer

  constructor(currentPage: number, total: number, payload: Buffer) {
    this.currentPage = currentPage
    this.total = total
    this.buffer = payload
  }

  public asArray() {
    return [this.currentPage.toString(), this.total.toString(), this.buffer.toString()]
  }
}

class FullPayload implements Payload {
  private messages: IACMessageDefinition[]

  constructor(messages: IACMessageDefinition[]) {
    if (typeof messages === 'object') {
      this.messages = messages
    } else if (typeof messages === 'string') {
      this.messages = messages
    } else {
      throw new Error('UNKNOWN FORMAT')
    }
  }

  public asJson(): Object {
    return this.messages
  }

  public asArray(): any {
    console.log('messages', this.messages)
    return this.messages.map(message => new Message(message.type, message.schema, 'eth', message.data).asArray())
  }

  public asBuffer(): Buffer {
    return rlp.encode(this.asArray()) as any
  }

  public asString(): string {
    return bs58check.encode(this.asBuffer())
  }
}

type IACProtocolVersion = number
type IACProtocolType = [IACProtocolVersion, IACPayloadType, Payload]

// IACProtocolMessage instead of IACProtocol?
export class IACProtocol {
  public readonly version: number = 2
  public readonly payloadType: IACPayloadType
  public payload: Payload

  constructor(data: string | Payload) {
    if (typeof data === 'string') {
      // Encoded string and we need to decode it
      // We can then initialize it either as Chunked or Full
      this.payloadType = IACPayloadType.FULL
      this.payload = new FullPayload(data as any) // TODO: Placeholder
    } else if (data instanceof FullPayload) {
      this.payloadType = IACPayloadType.FULL
      this.payload = data
    } else if (data instanceof ChunkedPayload) {
      this.payloadType = IACPayloadType.CHUNKED
      this.payload = data
    } else {
      throw new Error('FORMAT NOT SUPPORTED')
    }
  }

  public decoded(): IACProtocolType {
    return [this.version, this.payloadType, this.payload]
  }

  public encoded(): string {
    console.log('before encoded: ', [this.version.toString(), this.payloadType.toString(), this.payload.asArray()])
    return bs58check.encode(rlp.encode([this.version.toString(), this.payloadType.toString(), this.payload.asArray() as any]) as any)
  }

  public static create(data: IACMessageDefinition[], chunkSize: number = 0): IACProtocol[] {
    const payload: FullPayload = new FullPayload(data)

    const rawPayload: Buffer = payload.asBuffer()

    if (chunkSize > 0 && rawPayload.length > chunkSize) {
      const chunks: Buffer[] = []
      const nodeBuffer: Buffer = rawPayload
      const bufferLength: number = rawPayload.length

      let i: number = 0
      while (i < bufferLength) {
        chunks.push(nodeBuffer.slice(i, (i += chunkSize)))
      }

      return chunks.map((chunk: Buffer, index: number) => new IACProtocol(new ChunkedPayload(index, chunks.length, chunk)))
    } else {
      return [new IACProtocol(payload)]
    }
  }

  public static createFromEncoded(data: string[]): any[] {
    data.forEach(entry => {
      const decoded = rlp.decode(bs58check.decode(entry))
      const version = decoded[0].toString()
      const type = decoded[1].toString()
      const payload = decoded[2]
      const message = new Message(payload as any, {}, '', '')
      console.log(version, type, message)

      // TODO: Return IACProtocol with Payload
      // return new IACProtocol(new FullPayload(message))
    })
    if (data.length > 1) {
      // chunked
    } else if (data.length === 1) {
      // full
      // return new IACProtocol(new FullPayload(data))
    } else {
      throw new Error('EMPTY ARRAY')
    }

    return []
  }
}

const serializer = new Serializer()

const result = serializer.serialize(
  [
    {
      type: IACMessageType.AccountShareResponse,
      data: {
        publicKey: '1',
        derivationPath: '2',
        isExtendedPublicKey: true
      }
    }
  ],
  1000
)

console.log('result', result)

const serializer2 = new Serializer()

const reconstructed = serializer2.deserialize(result)

console.log('reconstructed', reconstructed)
