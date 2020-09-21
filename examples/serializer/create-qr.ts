import { Serializer } from '../../src/serializer/serializer'

const json = {
  type: 0,
  protocol: 'eth',
  payload: {
    publicKey: '03fa2f3feba70a71e0a4a6127af0a614bff7fd9752113752b0a338ab643d30a23c',
    transaction: {
      nonce: '0xaa',
      gasPrice: '0x16cbfe618',
      gasLimit: '0xcc44',
      to: '0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d',
      value: '100000000',
      chainId: 1,
      data: ''
    },
    callback: 'airgap-wallet://?d='
  }
}

const serializer = new Serializer()

serializer
  .serialize([json])
  .then((serialized) => {
    console.log(serialized)
  })
  .catch(console.error)
