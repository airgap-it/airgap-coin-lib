import { jsonToArray, rlpArrayToJson, unwrapSchema } from '../json-to-rlp/json-to-rlp'

import { AccountShareResponse } from './schemas/account-share-response'
import { MessageSignRequest } from './schemas/message-sign-request'
import { MessageSignResponse } from './schemas/message-sign-response'

const accountShareResponse = require('./schemas/account-share-response.json')

export const assertNever: (x: never) => void = (x: never): void => undefined

export type IACMessages = AccountShareResponse | MessageSignRequest | MessageSignResponse

export interface IACMessageDefinition {
  type: IACMessageType
  data: IACMessages
}

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

export class Message {
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
