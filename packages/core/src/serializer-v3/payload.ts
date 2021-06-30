import { IACMessageDefinitionObjectV3, Message, MessageDefinitionArray } from './message'

export class Payload {
  private readonly messages: IACMessageDefinitionObjectV3[]

  constructor(messages: IACMessageDefinitionObjectV3[]) {
    this.messages = messages
  }

  public static fromDecoded(object: IACMessageDefinitionObjectV3[]): Payload {
    return new Payload(object)
  }
  public static fromEncoded(encoded: MessageDefinitionArray[]): Payload {
    const messages: IACMessageDefinitionObjectV3[] = encoded.map((message) => Message.fromEncoded(message).asJson())

    return new Payload(messages)
  }

  public asJson(): IACMessageDefinitionObjectV3[] {
    return this.messages
  }

  public asArray(): MessageDefinitionArray[] {
    return this.messages.map((message: IACMessageDefinitionObjectV3) => Message.fromDecoded(message).asArray())
  }
}
