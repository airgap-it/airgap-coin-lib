import { IACMessageDefinitionObject, IACMessageType, Serializer } from '../../packages/serializer/src'

const serializeAndDeserialize = async (messages: IACMessageDefinitionObject[], size: number) => {
  const serializer: Serializer = new Serializer()

  const result: string[] = await serializer.serialize(messages, size)

  console.log(`Split up into ${result.length} chunks`, result)

  const serializer2: Serializer = new Serializer()

  const reconstructed: IACMessageDefinitionObject[] = await serializer2.deserialize(result)

  console.log(
    'reconstructed',
    reconstructed.map((el) => JSON.stringify(el))
  )
}

const signMessage: IACMessageDefinitionObject = {
  id: 'random__id',
  type: IACMessageType.MessageSignRequest,
  protocol: '' as any,
  payload: {
    message: 'this is my message',
    publicKey: '',
    callbackURL: 'https://airgap.it/?signedMessage='
  }
}

const messages = [signMessage]

serializeAndDeserialize(messages, 0)
