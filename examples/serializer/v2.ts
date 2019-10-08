import { IACMessageType } from '../../src/serializer/v2/interfaces'
import { IACMessageDefinition } from '../../src/serializer/v2/message'
import { Serializer } from '../../src/serializer/v2/serializer.new'

const serializeAndDeserialize = (messages: IACMessageDefinition[], size: number) => {
  const serializer = new Serializer()

  const result = serializer.serialize(messages, size)

  console.log(`Split up into ${result.length} chunks`, result)

  const serializer2 = new Serializer()

  const reconstructed = serializer2.deserialize(result)

  console.log('reconstructed', reconstructed)
}

const accountShareMessage: IACMessageDefinition = {
  type: IACMessageType.AccountShareResponse,
  data: {
    publicKey: '1',
    derivationPath: '2',
    isExtendedPublicKey: true
  }
}

const signTransactionRequest: IACMessageDefinition = {
  type: IACMessageType.TransactionSignRequest,
  protocol: 'ae',
  data: {
    transaction: {
      networkId: 'main',
      transaction: 'string'
    },
    publicKey: '1',
    callback: '2'
  }
}

const messages = [accountShareMessage, signTransactionRequest]

// serializeAndDeserialize(messages, 0)

serializeAndDeserialize(messages, 1)

// serializeAndDeserialize(accountShareMessage, 20)

// serializeAndDeserialize(accountShareMessage, 100)

// serializeAndDeserialize(accountShareMessage, 100000)
