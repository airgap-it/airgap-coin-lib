import { IACMessageType } from './interfaces'
import { PayloadType } from './payloads/payload'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { UnsignedAeternityTransaction } from './schemas/definitions/transaction-sign-request-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/definitions/transaction-sign-request-bitcoin'
import { UnsignedEthereumTransaction } from './schemas/definitions/transaction-sign-request-ethereum'
import { UnsignedTezosTransaction } from './schemas/definitions/transaction-sign-request-tezos'
import { SignedAeternityTransaction } from './schemas/definitions/transaction-sign-response-aeternity'
import { SignedBitcoinTransaction } from './schemas/definitions/transaction-sign-response-bitcoin'
import { SignedCosmosTransaction } from './schemas/definitions/transaction-sign-response-cosmos'
import { SignedEthereumTransaction } from './schemas/definitions/transaction-sign-response-ethereum'
import { SignedTezosTransaction } from './schemas/definitions/transaction-sign-response-tezos'
import { SchemaItem, SchemaTransformer } from './schemas/schema'
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
  | SignedTezosTransaction
  | SignedAeternityTransaction
  | SignedBitcoinTransaction
  | SignedCosmosTransaction
  | SignedEthereumTransaction

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
  private readonly version: string = '0' // TODO: Version depending on the message type
  private readonly schema: SchemaItem
  private readonly schemaTransformer: SchemaTransformer | undefined

  public readonly type: number
  public readonly protocol: string
  public readonly payload: IACMessages

  constructor(type: PayloadType, object: Buffer[] | IACMessageDefinitionObject) {
    if (type === PayloadType.DECODED) {
      const x = object as IACMessageDefinitionObject
      this.type = x.type
      this.protocol = x.protocol
      this.payload = x.payload
      const schemaInfo = Serializer.getSchema(this.type.toString(), this.protocol)
      this.schema = unwrapSchema(schemaInfo.schema)
      this.schemaTransformer = schemaInfo.transformer
    } else if (type === PayloadType.ENCODED) {
      const x = object as Buffer[]
      this.version = x[0].toString()
      this.type = parseInt(x[1].toString(), 10)
      this.protocol = x[2].toString()
      const schemaInfo = Serializer.getSchema(this.type.toString(), this.protocol)
      this.schema = unwrapSchema(schemaInfo.schema)
      this.schemaTransformer = schemaInfo.transformer
      const json: IACMessages = (rlpArrayToJson(this.schema, x[3] as RLPData) as any) as IACMessages
      this.payload = this.schemaTransformer ? this.schemaTransformer(json) : json
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
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
}
