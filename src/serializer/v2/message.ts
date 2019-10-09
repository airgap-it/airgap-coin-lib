import { jsonToArray, rlpArrayToJson, unwrapSchema } from '../json-to-rlp/json-to-rlp'
import { SignedBitcoinTransaction } from '../signed-transactions/bitcoin-transactions.serializer'
import { UnsignedEthereumTransaction } from '../unsigned-transactions/ethereum-transactions.serializer'

import { IACMessageType } from './interfaces'
import { PayloadType } from './payload'
import { AccountShareResponse } from './schemas/account-share-response'
import { MessageSignRequest } from './schemas/message-sign-request'
import { MessageSignResponse } from './schemas/message-sign-response'
import { SignedAeternityTransaction } from './schemas/signed-transaction-aeternity'
import { SignedEthereumTransaction } from './schemas/signed-transaction-ethereum'
import { SignedTezosTransaction } from './schemas/signed-transaction-tezos'
import { UnsignedAeternityTransaction } from './schemas/unsigned-transaction-aeternity'
import { UnsignedBitcoinTransaction } from './schemas/unsigned-transaction-bitcoin'
import { UnsignedTezosTransaction } from './schemas/unsigned-transaction-tezos'
import { Serializer } from './serializer.new'

export const assertNever: (x: never) => void = (x: never): void => undefined

export type IACMessages =
  | AccountShareResponse
  | MessageSignRequest
  | MessageSignResponse
  | UnsignedTezosTransaction
  | UnsignedAeternityTransaction
  | UnsignedBitcoinTransaction
  | UnsignedEthereumTransaction
  | SignedTezosTransaction
  | SignedAeternityTransaction
  | SignedBitcoinTransaction
  | SignedEthereumTransaction

export interface IACMessageDefinition {
  type: IACMessageType
  protocol?: string
  data: IACMessages
}

export class Message implements IACMessageDefinition {
  private readonly version: string = '0' // TODO: Version depending on the message type
  private readonly schema: Object

  public readonly type: number
  public readonly protocol: string
  public readonly data: any

  constructor(type: PayloadType, object: Buffer[] | { messageType: number; protocol?: string; data: any }) {
    if (type === PayloadType.DECODED) {
      const x = object as { messageType: number; protocol: string; data: any }
      this.type = x.messageType
      this.schema = Serializer.getSchema(x.messageType.toString(), x.protocol)
      this.protocol = x.protocol
      this.data = x.data
    } else if (type === PayloadType.ENCODED) {
      const x = object as Buffer[]
      this.version = x[0].toString()
      this.type = parseInt(x[1].toString(), 10)
      this.protocol = x[2].toString()
      this.schema = unwrapSchema(Serializer.getSchema(this.type.toString(), this.protocol))
      this.data = rlpArrayToJson((this.schema as any).properties, x[3] as any)
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asJson(): IACMessageDefinition {
    return {
      type: this.type,
      protocol: this.protocol,
      data: this.data
    }
  }

  public asArray(): string[] {
    const array = jsonToArray('root', unwrapSchema(this.schema), this.data)

    return [this.version, this.type.toString(), this.protocol, array]
  }
}
