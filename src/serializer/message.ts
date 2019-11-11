import { jsonToArray, rlpArrayToJson, unwrapSchema } from './utils/json-to-rlp'
import { RLPData } from './utils/toBuffer'

import { IACMessageType } from './interfaces'
import { PayloadType } from './payloads/payload'
import { AccountShareResponse } from './schemas/definitions/account-share-response'
import { MessageSignRequest } from './schemas/definitions/message-sign-request'
import { MessageSignResponse } from './schemas/definitions/message-sign-response'
import { SignedAeternityTransaction } from './schemas/definitions/signed-transaction-aeternity'
import { SignedBitcoinTransaction } from './schemas/definitions/signed-transaction-bitcoin'
import { SignedCosmosTransaction } from './schemas/definitions/signed-transaction-cosmos'
import { SignedEthereumTransaction } from './schemas/definitions/signed-transaction-ethereum'
import { SignedTezosTransaction } from './schemas/definitions/signed-transaction-tezos'
import { UnsignedAeternityTransaction } from './schemas/definitions/unsigned-transaction-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/definitions/unsigned-transaction-bitcoin'
import { UnsignedCosmosTransaction } from './schemas/definitions/unsigned-transaction-cosmos'
import { UnsignedEthereumTransaction } from './schemas/definitions/unsigned-transaction-ethereum'
import { UnsignedTezosTransaction } from './schemas/definitions/unsigned-transaction-tezos'
import { Serializer } from './serializer'

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
  private readonly schema: Object

  public readonly type: number
  public readonly protocol: string
  public readonly payload: IACMessages

  constructor(type: PayloadType, object: Buffer[] | IACMessageDefinitionObject) {
    if (type === PayloadType.DECODED) {
      const x = object as IACMessageDefinitionObject
      this.type = x.type
      this.schema = Serializer.getSchema(x.type.toString(), x.protocol)
      this.protocol = x.protocol
      this.payload = x.payload
    } else if (type === PayloadType.ENCODED) {
      const x = object as Buffer[]
      this.version = x[0].toString()
      this.type = parseInt(x[1].toString(), 10)
      this.protocol = x[2].toString()
      this.schema = unwrapSchema(Serializer.getSchema(this.type.toString(), this.protocol))
      this.payload = rlpArrayToJson((this.schema as any).properties, x[3] as any)
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
    const array: RLPData = jsonToArray('root', unwrapSchema(this.schema), this.payload)

    return [this.version, this.type.toString(), this.protocol, array]
  }
}
