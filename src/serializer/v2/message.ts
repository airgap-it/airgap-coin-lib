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
  protocol?: 'btc' | 'eth' | 'xtz' | 'ae' | 'grs'
  data: IACMessages
}

export class Message {
  private version: string = '0'
  public type: number
  private schema: Object
  private protocol: string
  private data: any

  constructor(type: PayloadType, object: Buffer | { messageType: number; protocol?: string; data: any }) {
    if (type === PayloadType.DECODED) {
      const x = object as { messageType: number; protocol: string; data: any }
      this.type = x.messageType
      if (x.protocol) {
        this.schema = Serializer.getSchema(x.messageType.toString(), x.protocol)
      } else {
        this.schema = Serializer.getSchema(x.messageType.toString())
      }
      this.protocol = x.protocol
      this.data = x.data
    } else if (type === PayloadType.ENCODED) {
      const x = object as Buffer
      console.log('messageType', x[0])
      this.version = x[0][0].toString()
      this.type = parseInt(x[0][1].toString(), 10)
      this.protocol = x[0][2].toString()
      console.log('a')
      this.schema = unwrapSchema(Serializer.getSchema(this.type.toString(), this.protocol)) // TODO: Select schema according to protocol
      console.log('b')
      console.log('decoded message', this.version, this.type, this.protocol, x[0][3])
      this.data = rlpArrayToJson((this.schema as any).properties, x[0][3] as any)
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asArray(): string[] {
    console.log('c', this.schema)
    const array = jsonToArray('root', unwrapSchema(this.schema), this.data)
    console.log(array)

    return [this.version /* TODO Set value */, this.type.toString(), this.protocol, array]
  }
}
