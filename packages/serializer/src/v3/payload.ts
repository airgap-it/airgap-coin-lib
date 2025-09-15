import { Failure, failure, Result, success } from './interfaces'
import { IACMessageDefinitionObjectV3, Message, MessageDefinitionArray } from './message'
import { SerializerV3 } from './serializer'

export class Payload {
  private readonly messages: Result<IACMessageDefinitionObjectV3, Error>[]

  constructor(messages: Result<IACMessageDefinitionObjectV3, Error>[]) {
    this.messages = messages
  }

  public static fromDecoded(object: Result<IACMessageDefinitionObjectV3, Error>[]): Payload {
    return new Payload(object)
  }
  // public static fromEncoded(encoded: MessageDefinitionArray[], serializer: SerializerV3 = SerializerV3.getInstance()): Payload {
  //   const messages: IACMessageDefinitionObjectV3[] = encoded.map((message) => Message.fromEncoded(message, serializer).asJson())

  //   return new Payload(messages)
  // }

  public static fromEncoded(
    encoded: MessageDefinitionArray[],
    serializer: SerializerV3 = SerializerV3.getInstance()
  ): { payload: Payload; skippedPayload: Result<IACMessageDefinitionObjectV3, Error>[] } {
    const messages: Result<IACMessageDefinitionObjectV3, Error>[] = []
    const errors: Result<IACMessageDefinitionObjectV3, Error>[] = []

    for (const message of encoded) {
      try {
        const result = Message.fromEncoded(message, serializer)
        if (result.ok) {
          messages.push(success(result.value.asJson()))
        } else {
          errors.push(failure((result as Failure<Error>).error))
        }
      } catch (error) {
        errors.push(failure(error))
      }
    }

    return { payload: new Payload(messages), skippedPayload: errors }
  }

  public asJson(): Result<IACMessageDefinitionObjectV3, Error>[] {
    return this.messages
  }

  public asArray(serializer: SerializerV3 = SerializerV3.getInstance()): Result<MessageDefinitionArray, Error>[] {
    return this.messages.map((message: Result<IACMessageDefinitionObjectV3, Error>) =>
      message.ok ? success(Message.fromDecoded(message.value).asArray(serializer)) : failure((message as Failure<Error>).error)
    )
  }
}
