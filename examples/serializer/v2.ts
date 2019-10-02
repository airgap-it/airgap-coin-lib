import { IACMessageType } from '../../src/serializer/v2/message'
import { Serializer } from '../../src/serializer/v2/serializer.new'

const serializeAndDeserialize = (messages: any, size: number) => {
  const serializer = new Serializer()

  const result = serializer.serialize(messages, size)

  console.log(`Split up into ${result.length} chunks`, result)

  const serializer2 = new Serializer()

  const reconstructed = serializer2.deserialize(result)

  console.log('reconstructed', reconstructed)
}

const accountShareMessage = [
  {
    type: IACMessageType.AccountShareResponse,
    data: {
      publicKey: '1',
      derivationPath: '2',
      isExtendedPublicKey: true
    }
  }
]

serializeAndDeserialize(accountShareMessage, 0)

serializeAndDeserialize(accountShareMessage, 20)

// serializeAndDeserialize(accountShareMessage, 20)

// serializeAndDeserialize(accountShareMessage, 100)

// serializeAndDeserialize(accountShareMessage, 100000)
