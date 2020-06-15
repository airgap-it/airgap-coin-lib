import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../../dependencies/src/rlp-2.2.3/index'
import { assertNever, IACMessageDefinitionObject, Message } from '../message'
import { RLPData } from '../utils/toBuffer'

import { Payload, PayloadType } from './payload'

interface PayloadTypeReturnType {
  [PayloadType.ENCODED]: Buffer[]
  [PayloadType.DECODED]: IACMessageDefinitionObject[]
}

export class FullPayload implements Payload {
  private readonly messages: IACMessageDefinitionObject[]

  constructor(type: PayloadType, object: PayloadTypeReturnType[PayloadType]) {
    if (type === PayloadType.DECODED) {
      this.messages = object as IACMessageDefinitionObject[]
    } else if (type === PayloadType.ENCODED) {
      this.messages = (object as Buffer[]).map((buffer) => new Message(PayloadType.ENCODED, (buffer as any) as Buffer[]).asJson())
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asJson(): IACMessageDefinitionObject[] {
    return this.messages
  }

  public asArray(): RLPData /* TODO: Fix type */ {
    return this.messages.map((message: IACMessageDefinitionObject) =>
      new Message(PayloadType.DECODED, {
        type: message.type,
        protocol: message.protocol,
        payload: message.payload
      }).asArray()
    )
  }

  public asBuffer(): Buffer {
    return rlp.encode(this.asArray())
  }

  public asString(): string {
    return bs58check.encode(this.asBuffer())
  }
}
