import * as BIP39 from 'bip39'
import { ICoinProtocol, AEProtocol, EthereumProtocol } from '../../lib'

const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const seed = BIP39.mnemonicToSeedHex(mnemonic)

interface TestProtocolSpec {
  name: string
  lib: ICoinProtocol
  wallet: {
    privateKey: string
    publicKey: string
    address: string
    tx: {
      amount: number
      fee: number
    }
  }
  txs: {
    unsignedTx: string | {}
    unsignedHexTx?: string
    signedTx: string
  }[]
}

const protocols: TestProtocolSpec[] = []

// Ethereum
protocols.push({
  name: 'Ethereum',
  lib: new EthereumProtocol(),
  wallet: {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    address: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
    tx: {
      amount: 10,
      fee: 10
    }
  },
  txs: [
    {
      unsignedTx: {
        from: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        nonce: '0x00',
        gasPrice: '0x04a817c800',
        gasLimit: '0x5208',
        to: '0xf5E54317822EBA2568236EFa7b08065eF15C5d42',
        value: '0x0de0b6b3a7640000',
        data: '0x',
        chainId: 1
      },
      signedTx:
        'f86c808504a817c80082520894f5e54317822eba2568236efa7b08065ef15c5d42880de0b6b3a76400008026a06aa2c02eb94341aa7370671a92bdaf942d43460ec1ca0e2db2863711fa7dd019a007cd8ea044113236b7ae06f1ab3d252a458436c651151421c8ddb53f387f9e98'
    }
  ]
})

// Aeternity Native Token
protocols.push({
  name: 'Aeternity',
  lib: new AEProtocol(),
  wallet: {
    privateKey:
      '7c9a774cf8855c0a89a00df3312cb1a3fb47d47829d3c92840e6a31b21434fa72d451a8abe91b3990b958097587de30216ceeb0e08102a4fe77c6ecb1cf9b42a',
    publicKey: '2d451a8abe91b3990b958097587de30216ceeb0e08102a4fe77c6ecb1cf9b42a',
    address: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
    tx: {
      amount: 10,
      fee: 10
    }
  },
  txs: [
    {
      /*
        HEX of Unsigned TX includes:
        sender_id: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
        recipient_id: 'ak_LwMsF36UntQgAiQ21UeSuvNw8kbtfAec9C1FW15GQEFLL5pq1',
        amount: 10,
        fee: 10,
        ttl: 60,
        payload: ''
      */
      unsignedTx: 'tx_CweQbGJzixZ6ZWprHc5GYjwJEDA2HUPXL8G7RFgZePzHhqZRqsTBrWXDmFHBivWATLgzZc9oSa6cRA3R2WAjzyPguDZqtzJpXATLK8AxivnvxWi',
      signedTx: ''
    }
  ]
})

export { protocols, mnemonic, seed, TestProtocolSpec }
