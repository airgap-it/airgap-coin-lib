import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import * as rlp from '@airgap/coinlib-core/dependencies/src/rlp-2.2.3/index'

import { IACMessageDefinitionObject, Message } from '../message'
import { RLPData } from '../utils/toBuffer'

import { Payload } from './payload'
import { Serializer } from '../serializer'

export class FullPayload implements Payload {
  private readonly messages: IACMessageDefinitionObject[]

  constructor(messages: IACMessageDefinitionObject[]) {
    this.messages = messages
  }

  public static fromDecoded(object: IACMessageDefinitionObject[]): FullPayload {
    return new FullPayload(object)
  }
  public static fromEncoded(buf: Buffer[], serializer: Serializer = Serializer.getInstance()): FullPayload {
    const messages: IACMessageDefinitionObject[] = buf.map((buffer) => Message.fromEncoded(buffer as any, serializer).asJson())

    return new FullPayload(messages)
  }

  public asJson(): IACMessageDefinitionObject[] {
    return this.messages
  }

  public asArray(serializer: Serializer = Serializer.getInstance()): RLPData /* TODO: Fix type */ {
    return this.messages.map((message: IACMessageDefinitionObject) => Message.fromDecoded(message, serializer).asArray())
  }

  public asBuffer(serializer: Serializer = Serializer.getInstance()): Buffer {
    return rlp.encode(this.asArray(serializer))
  }

  public asString(serializer: Serializer = Serializer.getInstance()): string {
    return bs58check.encode(this.asBuffer(serializer))
  }
}
