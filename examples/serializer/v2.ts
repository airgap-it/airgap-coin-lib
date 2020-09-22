import { IACMessageType } from '../../src/serializer/interfaces'
import { IACMessageDefinitionObject } from '../../src/serializer/message'
import { Serializer } from '../../src/serializer/serializer'
import { MainProtocolSymbols } from '../../src/utils/ProtocolSymbols'

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

const test = async () => {
  const parts: string[] = [
    'Gfeetd57BGiB2ZT3XSGTPNNacFnRP4bSftdDpfPyjNX9KWLexPk3LXZ7j8SzDxXkxaNND79SZbWEbkcL1NFkxjmU3dCRhr3c8MEdAh6vneBV4EugxJxPVDhzs8CpfRM5z5vbpo6ZkvHZBJUoXDQrdZVnTMSM',
    'Gfeetd57BJNhBm4X6uHHBQWnbUdkyHKd8YU65mnCjeCtuoeAf7dxrFJHeUJ53p2QZLEnBkcMFgVz5rBaNE5o8Xz84rwUDRKKz8P8GqZMkZgcAkzk6HpXh8DECszM7RZUgAc9t33nwYPa6dwwmuvkBGdARFBF',
    'SU7ECqP4oVfpEnkFuQwQrdGmb8y2BRiuNe1U4TWdtQmAwh7EYJRgamJibqGA9xV'
  ]

  const serializer2: Serializer = new Serializer()

  const reconstructed: IACMessageDefinitionObject[] = await serializer2.deserialize(parts)

  console.log(
    'reconstructed2',
    reconstructed.map((el) => JSON.stringify(el))
  )
}

test()

const accountShareMessage: IACMessageDefinitionObject = {
  id: 'asdfdfgsdfgsdfgsdfg',
  type: IACMessageType.AccountShareResponse,
  protocol: '' as any,
  payload: {
    group: 'asdf',
    publicKey: '1',
    derivationPath: '2',
    isExtendedPublicKey: true
  }
}

// const signTransactionRequest: IACMessageDefinitionObject = {
//   id: 'asdfdfgsdfgsdfgsdfg',
//   type: IACMessageType.TransactionSignRequest,
//   protocol: MainProtocolSymbols.AE,
//   payload: {
//     transaction: {
//       networkId: 'main',
//       transaction: 'txstring'
//     },
//     publicKey: '1',
//     callback: '2'
//   }
// }

const ethSignTransactionRequest: IACMessageDefinitionObject = {
  id: 'asdfdfgsdfgsdfgsdfg',
  type: IACMessageType.TransactionSignRequest,
  protocol: MainProtocolSymbols.ETH,
  payload: {
    transaction: {
      chainId: 3,
      data:
        '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f40000',
      gasLimit: '0x7bd9',
      gasPrice: '0x3b9aca00',
      nonce: '0x50',
      to: '0x2dd847af80418D280B7078888B6A6133083001C9',
      value: '0x0'
    },
    publicKey: '1',
    callbackURL: '2'
  }
}

const messages = [/* accountShareMessage, signTransactionRequest, */ ethSignTransactionRequest]

// serializeAndDeserialize(messages, 0)

// serializeAndDeserialize(messages, 1)

// serializeAndDeserialize(messages, 20)

serializeAndDeserialize(messages, 100)
serializeAndDeserialize([accountShareMessage], 100)

// serializeAndDeserialize(messages, 100000)
