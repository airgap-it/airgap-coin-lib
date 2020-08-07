import { ProtocolSymbols, MainProtocolSymbols } from '../utils/ProtocolSymbols'

import { IACMessageType } from './interfaces'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { SignedAeternityTransaction } from './schemas/definitions/signed-transaction-aeternity'
import { SignedBitcoinTransaction } from './schemas/definitions/signed-transaction-bitcoin'
import { SignedCosmosTransaction } from './schemas/definitions/signed-transaction-cosmos'
import { SignedEthereumTransaction } from './schemas/definitions/signed-transaction-ethereum'
import { SignedSubstrateTransaction } from './schemas/definitions/signed-transaction-substrate'
import { SignedTezosTransaction } from './schemas/definitions/signed-transaction-tezos'
import { UnsignedAeternityTransaction } from './schemas/definitions/unsigned-transaction-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/definitions/unsigned-transaction-bitcoin'
import { UnsignedEthereumTransaction } from './schemas/definitions/unsigned-transaction-ethereum'
import { UnsignedSubstrateTransaction } from './schemas/definitions/unsigned-transaction-substrate'
import { UnsignedTezosTransaction } from './schemas/definitions/unsigned-transaction-tezos'
import { SchemaInfo, SchemaItem, SchemaTransformer } from './schemas/schema'
import { Serializer } from './serializer'
import { UnsignedCosmosTransaction } from './types'
import { generateId } from './utils/generateId'
import { jsonToArray, rlpArrayToJson, unwrapSchema } from './utils/json-to-rlp'
import { RLPData } from './utils/toBuffer'

const ID_LENGTH: number = 10

export const assertNever: (x: never) => void = (x: never): void => undefined

export type IACMessages =
  | AccountShareResponse
  | MessageSignRequest
  | MessageSignResponse
  | UnsignedTezosTransaction
  | UnsignedAeternityTransaction
  | UnsignedBitcoinTransaction
  | UnsignedCosmosTransaction
  | UnsignedEthereumTransaction
  | UnsignedSubstrateTransaction
  | SignedTezosTransaction
  | SignedAeternityTransaction
  | SignedBitcoinTransaction
  | SignedCosmosTransaction
  | SignedEthereumTransaction
  | SignedSubstrateTransaction

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
  [3]: Buffer // string // Id
  [4]: Buffer // RLPData // Message
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
    id: string = generateId(ID_LENGTH),
    version: string = '0'
  ) {
    this.id = id
    this.type = type
    this.protocol = protocol
    this.payload = payload
    this.version = version

    const schemaInfo: SchemaInfo = Serializer.getSchema(this.type.toString(), this.protocol)
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

    return [this.version, this.type.toString(), this.protocol, this.id, array]
  }

  public static fromDecoded(object: IACMessageDefinitionObject): Message {
    return new Message(object.type, object.protocol, object.payload, object.id)
  }

  public static fromEncoded(buf: MessageDefinitionArray): Message {
    const version: string = this.parseVersion(buf[0])
    const type: IACMessageType = this.parseType(buf[1])
    const protocol: ProtocolSymbols = this.parseProtocol(buf[2])
    const id: string = this.parseId(buf[3])
    const encodedPayload: RLPData = this.parsePayload(buf[4])

    const schemaInfo: SchemaInfo = Serializer.getSchema(type.toString(), protocol)
    const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
    const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
    const json: IACMessages = (rlpArrayToJson(schema, encodedPayload) as any) as IACMessages
    const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json

    return new Message(type, protocol, payload, id, version)
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
    return this.validateProperty<IACMessageType, string>(
      'Type',
      buffer,
      (buf: Buffer) => buf.toString(),
      (val: string) => {
        try {
          Serializer.getSchema(val, MainProtocolSymbols.ETH) // TODO: Remove hardcoded protocol

          return true
        } catch (error) {
          return false
        }
      }
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
      throw Error(`${property} is empty`)
    }

    const parsed: U = parse(buffer)

    if (validate(parsed)) {
      return (parsed as unknown) as T // TODO: Use type guard?
    }

    throw new Error(`${property} is invalid: "${parsed}"`)
  }
}
