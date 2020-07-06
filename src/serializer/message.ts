import { IACMessageType } from './interfaces'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { UnsignedAeternityTransaction } from './schemas/definitions/transaction-sign-request-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/definitions/transaction-sign-request-bitcoin'
import { UnsignedEthereumTransaction } from './schemas/definitions/transaction-sign-request-ethereum'
import { UnsignedSubstrateTransaction } from './schemas/definitions/transaction-sign-request-substrate'
import { UnsignedTezosTransaction } from './schemas/definitions/transaction-sign-request-tezos'
import { SignedAeternityTransaction } from './schemas/definitions/transaction-sign-response-aeternity'
import { SignedBitcoinTransaction } from './schemas/definitions/transaction-sign-response-bitcoin'
import { SignedCosmosTransaction } from './schemas/definitions/transaction-sign-response-cosmos'
import { SignedEthereumTransaction } from './schemas/definitions/transaction-sign-response-ethereum'
import { SignedSubstrateTransaction } from './schemas/definitions/transaction-sign-response-substrate'
import { SignedTezosTransaction } from './schemas/definitions/transaction-sign-response-tezos'
import { SchemaInfo, SchemaItem, SchemaTransformer } from './schemas/schema'
import { Serializer } from './serializer'
import { UnsignedCosmosTransaction } from './types'
import { jsonToArray, rlpArrayToJson, unwrapSchema } from './utils/json-to-rlp'
import { RLPData } from './utils/toBuffer'

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
  type: IACMessageType
  protocol: string
  payload: IACMessages
}

export interface MessageDefinitionArray {
  [0]: string // Version
  [1]: string // Type
  [2]: string // Protocol
  [3]: RLPData // Message
}

export class Message implements IACMessageDefinitionObject {
  private readonly version: string // TODO: Version depending on the message type
  private readonly schema: SchemaItem

  public readonly type: IACMessageType
  public readonly protocol: string
  public readonly payload: IACMessages

  constructor(type: IACMessageType, protocol: string, payload: IACMessages, version: string = '0') {
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
      payload: this.payload
    }
  }

  public asArray(): RLPData /* it could be MessageDefinitionArray */ {
    const array: RLPData = jsonToArray('root', this.schema, this.payload)

    return [this.version, this.type.toString(), this.protocol, array]
  }

  public static fromDecoded(object: IACMessageDefinitionObject): Message {
    return new Message(object.type, object.protocol, object.payload)
  }

  public static fromEncoded(buf: MessageDefinitionArray): Message {
    const version: string = buf[0].toString()
    const type: number = parseInt(buf[1].toString(), 10)
    const protocol: string = buf[2].toString()
    const encodedPayload: RLPData = buf[3]
    const schemaInfo: SchemaInfo = Serializer.getSchema(type.toString(), protocol)
    const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
    const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
    const json: IACMessages = (rlpArrayToJson(schema, encodedPayload) as any) as IACMessages
    const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json

    return new Message(type, protocol, payload, version)
  }
}
