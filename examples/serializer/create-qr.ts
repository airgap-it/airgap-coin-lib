import { IACMessageType } from '../../packages/core/src/serializer-v3/interfaces'
import { IACMessageDefinitionObject } from '../../packages/core/src/serializer-v3/message'
import { SerializerV3 } from '../../packages/core/src/serializer-v3/serializer'
import { generateId } from '../../packages/core/src/serializer-v3/utils/generateId'
import { MainProtocolSymbols } from '../../packages/core/src/utils/ProtocolSymbols'

const json: IACMessageDefinitionObject = {
  type: IACMessageType.TransactionSignRequest,
  id: generateId(8),
  protocol: MainProtocolSymbols.ETH,
  payload: {
    publicKey: '03fa2f3feba70a71e0a4a6127af0a614bff7fd9752113752b0a338ab643d30a23c',
    transaction: {
      nonce: '0xaa',
      gasPrice: '0x16cbfe618',
      gasLimit: '0xcc44',
      to: '0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d',
      value: '0x100000000',
      chainId: 1,
      data: '0x'
    },
    callbackURL: 'airgap-wallet://?d={}'
  }
}
json

const accountShare = {
  id: generateId(8),
  type: 4,
  protocol: MainProtocolSymbols.AE,
  payload: {
    publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
    derivationPath: 'm/44h/457h/0h/0h/0h',
    isExtendedPublicKey: true
  }
}
accountShare

const signMessage: IACMessageDefinitionObject = {
  id: generateId(8),
  type: IACMessageType.MessageSignRequest,
  protocol: '' as any,
  payload: {
    message: 'this is my message',
    publicKey: '129581985918305193850193850183491284',
    callbackURL: 'https://airgap.it/?signedMessage='
  }
}
signMessage

const serializer = new SerializerV3()

serializer
  .serialize([accountShare])
  .then(async (serialized) => {
    console.log(serialized)
    const deserialized = await serializer.deserialize(serialized)
    console.log(JSON.stringify(deserialized, null, 2))
  })
  .catch(console.error)
