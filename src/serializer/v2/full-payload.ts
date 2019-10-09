import * as bs58check from 'bs58check'
import * as rlp from 'rlp'

import { assertNever, IACMessageDefinition, Message } from './message'
import { Payload, PayloadType } from './payload'

interface PayloadTypeReturnType {
  [PayloadType.ENCODED]: Buffer[]
  [PayloadType.DECODED]: IACMessageDefinition[]
}

export class FullPayload implements Payload {
  private readonly messages: IACMessageDefinition[]

  constructor(type: PayloadType, object: PayloadTypeReturnType[PayloadType]) {
    if (type === PayloadType.DECODED) {
      this.messages = object as IACMessageDefinition[]
    } else if (type === PayloadType.ENCODED) {
      this.messages = (object as Buffer[]).map(buffer => new Message(PayloadType.ENCODED, buffer as any as Buffer[]).asJson())
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asJson(): IACMessageDefinition[] {
    return this.messages
  }

  public asArray(): any[] /* TODO: Fix type */ {
    return this.messages.map(message =>
      new Message(PayloadType.DECODED, {
        messageType: message.type,
        protocol: message.protocol,
        data: message.data
      }).asArray()
    )
  }

  public asBuffer(): Buffer {
    return rlp.encode(this.asArray()) as any
  }

  public asString(): string {
    return bs58check.encode(this.asBuffer())
  }
}
