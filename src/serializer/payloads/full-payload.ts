import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../../dependencies/src/rlp-2.2.3/index'
import { IACMessageDefinitionObject, Message } from '../message'
import { RLPData } from '../utils/toBuffer'

import { Payload } from './payload'

export class FullPayload implements Payload {
  private readonly messages: IACMessageDefinitionObject[]

  constructor(messages: IACMessageDefinitionObject[]) {
    this.messages = messages
  }

  public static fromDecoded(object: IACMessageDefinitionObject[]): FullPayload {
    return new FullPayload(object)
  }
  public static fromEncoded(buf: Buffer[]): FullPayload {
    const messages: IACMessageDefinitionObject[] = buf.map((buffer) => Message.fromEncoded(buffer as any).asJson())

    return new FullPayload(messages)
  }

  public asJson(): IACMessageDefinitionObject[] {
    return this.messages
  }

  public asArray(): RLPData /* TODO: Fix type */ {
    return this.messages.map((message: IACMessageDefinitionObject) => Message.fromDecoded(message).asArray())
  }

  public asBuffer(): Buffer {
    return rlp.encode(this.asArray())
  }

  public asString(): string {
    return bs58check.encode(this.asBuffer())
  }
}
