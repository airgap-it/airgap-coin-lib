import * as bs58check from 'bs58check'
import * as rlp from 'rlp'

import { assertNever, IACMessageDefinition, Message } from './message'
import { Payload, PayloadType } from './payload'
import { Serializer } from './serializer.new'

export class FullPayload implements Payload {
  private readonly messages: IACMessageDefinition[]

  constructor(type: PayloadType, object: Buffer[] | IACMessageDefinition[] | string) {
    if (type === PayloadType.DECODED) {
      this.messages = object as any
    } else if (type === PayloadType.ENCODED) {
      this.messages = object as any
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asJson(): Object {
    return this.messages
  }

  public asArray(): any {
    console.log('messages', this.messages)

    return this.messages.map(message =>
      new Message(message.type, Serializer.schemas.get(message.type.toString()), 'eth', message.data).asArray()
    )
  }

  public asBuffer(): Buffer {
    return rlp.encode(this.asArray()) as any
  }

  public asString(): string {
    return bs58check.encode(this.asBuffer())
  }
}
