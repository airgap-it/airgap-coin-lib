import { IACMessageType } from '../../src/serializer/v2/interfaces'
import { IACMessageDefinitionObject } from '../../src/serializer/v2/message'
import { Serializer } from '../../src/serializer/v2/serializer.new'

const serializeAndDeserialize = (messages: IACMessageDefinitionObject[], size: number) => {
  const serializer = new Serializer()

  const result = serializer.serialize(messages, size)

  console.log(`Split up into ${result.length} chunks`, result)

  const serializer2 = new Serializer()

  const reconstructed = serializer2.deserialize(result)

  console.log('reconstructed', reconstructed.map(el => JSON.stringify(el)))
}

// const accountShareMessage: IACMessageDefinitionObject = {
//   type: IACMessageType.AccountShareResponse,
//   protocol: '',
//   data: {
//     publicKey: '1',
//     derivationPath: '2',
//     isExtendedPublicKey: true
//   }
// }

// const signTransactionRequest: IACMessageDefinitionObject = {
//   type: IACMessageType.TransactionSignRequest,
//   protocol: 'ae',
//   data: {
//     transaction: {
//       networkId: 'main',
//       transaction: 'txstring'
//     },
//     publicKey: '1',
//     callback: '2'
//   }
// }

const ethSignTransactionRequest: IACMessageDefinitionObject = {
  type: IACMessageType.TransactionSignRequest,
  protocol: 'eth',
  data: {
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
    callback: '2'
  }
}

const messages = [/*accountShareMessage, signTransactionRequest,*/ ethSignTransactionRequest]

// serializeAndDeserialize(messages, 0)

serializeAndDeserialize(messages, 1)

// serializeAndDeserialize(accountShareMessage, 20)

// serializeAndDeserialize(accountShareMessage, 100)

// serializeAndDeserialize(accountShareMessage, 100000)
