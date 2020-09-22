import { Serializer } from '../../src/serializer/serializer'

const json = {
  type: 0,
  protocol: 'eth',
  payload: {
    publicKey: '03fa2f3feba70a71e0a4a6127af0a614bff7fd9752113752b0a338ab643d30a23c',
    transaction: {
      nonce: '0x7',
      gasPrice: '0x38c42e187',
      gasLimit: '0x5208',
      to: '0x023e333F5c2568853159EA36025F2E7Eccf17703',
      value: '100000',
      chainId: 1,
      data: '0x'
    },
    callback: 'airgap-wallet://?d='
  }
}

const serializer = new Serializer()

serializer
  .serialize([json])
  .then((serialized) => {
    console.log(`airgap-vault://?d=${serialized}`)
  })
  .catch(console.error)
