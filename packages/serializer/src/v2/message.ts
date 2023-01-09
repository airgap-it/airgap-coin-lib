import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

import { IACMessageType } from './interfaces'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { SchemaInfo, SchemaItem, SchemaTransformer } from './schemas/schema'
import { Serializer } from './serializer'
import { TransactionSignRequest } from './transactions/transaction-sign-request'
import { TransactionSignResponse } from './transactions/transaction-sign-response'
import { generateIdV2 } from './utils/generateId'
import { jsonToArray, rlpArrayToJson, unwrapSchema } from './utils/json-to-rlp'
import { RLPData } from './utils/toBuffer'

const ID_LENGTH: number = 10

export type IACMessages = AccountShareResponse | MessageSignRequest | MessageSignResponse | TransactionSignRequest | TransactionSignResponse

// tslint:disable-next-line:interface-name
export interface IACMessageDefinitionObject {
  id: string
  type: IACMessageType
  protocol: ProtocolSymbols
  payload: IACMessages
}

export interface MessageDefinitionArray {
  [0]: Buffer // string // Version
  [1]: Buffer // string // Type
  [2]: Buffer // ProtocolSymbols // Protocol
  [3]: Buffer // RLPData // Message
  [4]: Buffer // string // Session ID
}

export class Message implements IACMessageDefinitionObject {
  private readonly version: string // TODO: Version depending on the message type
  private readonly schema: SchemaItem

  public readonly id: string
  public readonly type: IACMessageType
  public readonly protocol: ProtocolSymbols
  public readonly payload: IACMessages

  constructor(
    type: IACMessageType,
    protocol: ProtocolSymbols,
    payload: IACMessages,
    id: string = generateIdV2(ID_LENGTH),
    version: string = '1',
    serializer: Serializer = Serializer.getInstance()
  ) {
    this.id = id
    this.type = type
    this.protocol = protocol
    this.payload = payload
    this.version = version

    const schemaInfo: SchemaInfo = serializer.getSchema(this.type, this.protocol)
    this.schema = unwrapSchema(schemaInfo.schema)
  }

  public asJson(): IACMessageDefinitionObject {
    return {
      type: this.type,
      protocol: this.protocol,
      id: this.id,
      payload: this.payload
    }
  }

  public asArray(): RLPData /* it could be MessageDefinitionArray */ {
    const array: RLPData = jsonToArray('root', this.schema, this.payload)

    return [this.version, this.type.toString(), this.protocol, array, this.id]
  }

  public static fromDecoded(object: IACMessageDefinitionObject, serializer: Serializer = Serializer.getInstance()): Message {
    return new Message(object.type, object.protocol, object.payload, object.id, undefined, serializer)
  }

  public static fromEncoded(buf: MessageDefinitionArray, serializer: Serializer = Serializer.getInstance()): Message {
    const version: string = this.parseVersion(buf[0])
    const type: IACMessageType = this.parseType(buf[1])
    const protocol: ProtocolSymbols = this.parseProtocol(buf[2])

    // Backwards compatiblity for version 0, before we had an ID
    const idBuf: Buffer | undefined = version === '0' ? Buffer.from(generateIdV2(ID_LENGTH)) : buf[4]
    // End Backwards compatibility

    const id: string = this.parseId(idBuf)
    const encodedPayload: RLPData = this.parsePayload(buf[3])

    const schemaInfo: SchemaInfo = Serializer.getSchema(type, protocol)
    const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
    const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
    const json: IACMessages = (rlpArrayToJson(schema, encodedPayload) as any) as IACMessages
    const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json

    return new Message(type, protocol, payload, id, version, serializer)
  }

  private static parseVersion(buffer: Buffer): string {
    return this.validateProperty<string, string>(
      'Version',
      buffer,
      (buf: Buffer) => buf.toString(),
      (val: string) => val === '0' || val === '1'
    )
  }

  private static parseType(buffer: Buffer): IACMessageType {
    return this.validateProperty<IACMessageType, number>(
      'Type',
      buffer,
      (buf: Buffer) => parseInt(buf.toString(), 10),
      (val: number) => Object.values(IACMessageType).includes(val)
    )
  }

  private static parseProtocol(buffer: Buffer): ProtocolSymbols {
    return this.validateProperty<ProtocolSymbols, string>(
      'Protocol',
      buffer,
      (buf: Buffer) => buf.toString(),
      (val: string) => val.length === 0 || Object.values(MainProtocolSymbols).some((value: string) => val.split('-')[0] === value)
    )
  }

  private static parseId(buffer: Buffer): string {
    return this.validateProperty<string, string>(
      'Id',
      buffer,
      (buf: Buffer) => buf.toString(),
      (val: string) => val.length === ID_LENGTH
    )
  }

  private static parsePayload(buffer: Buffer): string {
    return this.validateProperty<string, Buffer>(
      'Payload',
      buffer,
      (buf: Buffer) => buf,
      () => true
    )
  }

  private static validateProperty<T, U>(
    property: string,
    buffer: Buffer,
    parse: (buffer: Buffer) => U,
    validate: (value: U) => boolean
  ): T {
    if (typeof buffer === 'undefined') {
      throw new SerializerError(SerializerErrorType.PROPERTY_IS_EMPTY, `${property} is empty`)
    }

    const parsed: U = parse(buffer)

    if (validate(parsed)) {
      return (parsed as unknown) as T // TODO: Use type guard?
    }

    throw new SerializerError(SerializerErrorType.PROPERTY_IS_EMPTY, `${property} is invalid: "${parsed}"`)
  }
}
