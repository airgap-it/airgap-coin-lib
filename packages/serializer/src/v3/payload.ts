import { IACMessageDefinitionObjectV3, Message, MessageDefinitionArray } from './message'
import { SerializerV3 } from './serializer'

export class Payload {
  private readonly messages: IACMessageDefinitionObjectV3[]

  constructor(messages: IACMessageDefinitionObjectV3[]) {
    this.messages = messages
  }

  public static fromDecoded(object: IACMessageDefinitionObjectV3[]): Payload {
    return new Payload(object)
  }
  public static fromEncoded(encoded: MessageDefinitionArray[], serializer: SerializerV3 = SerializerV3.getInstance()): Payload {
    const messages: IACMessageDefinitionObjectV3[] = encoded.map((message) => Message.fromEncoded(message, serializer).asJson())

    return new Payload(messages)
  }

  public asJson(): IACMessageDefinitionObjectV3[] {
    return this.messages
  }

  public asArray(serializer: SerializerV3 = SerializerV3.getInstance()): MessageDefinitionArray[] {
    return this.messages.map((message: IACMessageDefinitionObjectV3) => Message.fromDecoded(message).asArray(serializer))
  }
}
