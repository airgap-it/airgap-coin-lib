import { IACMessageType } from '../src'
import { IACMessageDefinitionObject } from '../src/serializer/message'
import { Serializer } from '../src/serializer/serializer'
import { MainProtocolSymbols } from '../src/utils/ProtocolSymbols'

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

const signedBitcoinTransaction: IACMessageDefinitionObject = {
  id: '82e2187e-a734-4474-b889-4c24dc2480fb',
  type: IACMessageType.TransactionSignResponse,
  protocol: MainProtocolSymbols.BTC,
  payload: {
    from: ['addr1', 'addr2'],
    to: ['addr3', 'addr4'],
    amount: '123',
    fee: '321',
    accountIdentifier: 'identifier',
    transaction: '000402040204100',
    publicKey: '1',
    callbackURL: '2'
  }
}

serializeAndDeserialize([signedBitcoinTransaction], 100)
