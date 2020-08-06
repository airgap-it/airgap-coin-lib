import { ProtocolSymbols } from '../utils/ProtocolSymbols'

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
import { generateGUID } from './utils/generateUUID'
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
  id: string
  type: IACMessageType
  protocol: ProtocolSymbols
  payload: IACMessages
}

export interface MessageDefinitionArray {
  [0]: string // Version
  [1]: string // Type
  [2]: string // Id
  [3]: ProtocolSymbols // Protocol
  [4]: RLPData // Message
}

export class Message implements IACMessageDefinitionObject {
  private readonly version: string // TODO: Version depending on the message type
  private readonly schema: SchemaItem

  public readonly id: string
  public readonly type: IACMessageType
  public readonly protocol: ProtocolSymbols
  public readonly payload: IACMessages

  constructor(type: IACMessageType, protocol: ProtocolSymbols, payload: IACMessages, id: string = generateGUID(), version: string = '0') {
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

    return [this.version, this.type.toString(), this.id, this.protocol, array]
  }

  public static fromDecoded(object: IACMessageDefinitionObject): Message {
    return new Message(object.type, object.protocol, object.payload, object.id)
  }

  public static fromEncoded(buf: MessageDefinitionArray): Message {
    const version: string = buf[0].toString()
    const type: number = parseInt(buf[1].toString(), 10)
    const id: string = buf[2].toString()
    const protocol: ProtocolSymbols = buf[3].toString() as ProtocolSymbols
    const encodedPayload: RLPData = buf[4]
    // TODO: Add checks to check data above
    const schemaInfo: SchemaInfo = Serializer.getSchema(type.toString(), protocol)
    const schema: SchemaItem = unwrapSchema(schemaInfo.schema)
    const schemaTransformer: SchemaTransformer | undefined = schemaInfo.transformer
    const json: IACMessages = (rlpArrayToJson(schema, encodedPayload) as any) as IACMessages
    const payload: IACMessages = schemaTransformer ? schemaTransformer(json) : json

    return new Message(type, protocol, payload, id, version)
  }
}
