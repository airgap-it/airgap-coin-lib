import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { IACMessageDefinitionObject, Serializer } from '../src'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

const testData = [
  {
    message: {
      id: 'TuNhidUG9E',
      type: 4,
      protocol: 'ae',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'QEBGNJUDkpZevtiV5ZYBid6PYVsoy27T7LczQGovTxNuCcQ8syCANuaGEwUquBeWXS9pwRpirsT8GwXf7TD3s27ZyXDg8oR6kcE6Vbg1PNL5YSqvKggKCqWf26pSJTaygpnp7TBJZjaoUQFw3DqYDiwMkt9m8pQs'
    ]
  },
  {
    message: {
      id: 'jrH6G6j1L9',
      type: 4,
      protocol: 'ae',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhvzX8RpZCLuadybt82ZomtD4rAxcnyQ9dCyLJv4pv1KRk95LPMonSYnBFJG9YX8uWTXe3jccy',
      'FmwWgLpsoou4XDEDjKacXQFNaYwYvQtNUHdC4u4TJGsVhaswmHVWQLD7NjL4jbq8XwxJcqJLRJP95JvoLPSEN',
      '3tRVFxw8NhtU7vUNAijpfZopmi4a'
    ]
  },
  {
    message: {
      id: 'FIacMdP7V7',
      type: 4,
      protocol: 'btc',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      '66ds3Rvy92D8gFd9dpatACJrYj3goYAhEZkY6NoX4AAZfetmZ95reAnhpAgnEM4D9JsxXdw3DwfX9vuBQPoWAqgMVaZZaFDrPCsHprUNdNXLo3u8rQhqTdXCF76JvhPVXWcnJDqGHZdbB7DEoQB4hRnyy7QQUmATgzJke4oT1yLBKCXvMFM2CCUjQ6Keddjxpgr8LhZRiNjpn3duWEnUME9'
    ]
  },
  {
    message: {
      id: 'RS4jrBosji',
      type: 4,
      protocol: 'btc',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHifNYEuL33YBzszvnwNPjnnPnycD97b27fTSCjbqe8eGQP11V6y3nHmeKBhPC3F8nYSHYvqgZV',
      'FmwWgLpsoou3xySMq2nfg3RczkmsLYtTqwoYHjhKcjvP7C4ijBUGzY9Fn5KahqvfthjdA4YxMbPhbQj2XJtdG',
      'kojrhCZHPKEYxUoLPYbEASuwbTdSychmxswR2efjwF1k7WEQcUMX6qnDNJQujg4mSboMFrVk9rGCWuLsww'
    ]
  },
  {
    message: {
      id: 'PUvatKiEI3',
      type: 4,
      protocol: 'cosmos',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '3d11L5MFzJ49DMJjsoz8HA9Xx77Lyiuy1XDStrJo8gKjq52UK1KAi8GCYXMkKYZP8FgcczE98Z52SRPqcKHQhhgCTjeDxxaZUHzGUMcuHiDSaarZsQene5cXWp5n3fquPNET9oYbYAw2Fe2usasrTJu8ftLnLHA2yLTHZc'
    ]
  },
  {
    message: {
      id: 'h0uHpSM0fr',
      type: 4,
      protocol: 'cosmos',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHi1EKe5NWKn2UY4bKY9BP8yryGj4gZjGGHC1bEToJfXTegybaVgFoxX5toXyhSD1nnzqEGyrKv',
      'FmwWgLpsoou4Mw2p5npwqBjqcGmfNx96bofgKTkSGUK6x341GzznyzjykHHHuAjNAHNo1hK2FQbG4tE1L2Pgv',
      'LFhi4Jim1CUyt2xKVS9nYYrKxqHLffXjn'
    ]
  },
  {
    message: {
      id: '6g67VUX3rq',
      type: 4,
      protocol: 'eth',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'QEBGNJUDkpZevtisHzUmTQkS4QFehuPKq9nYbvMtGvr4vuJ5SKZY6vqHUAckZQd27uAEaAgF2pegxfbhQ4CvhuyzdQ2MnnSHUqPFrysmDqoBxpE3gXTMUfTTvEZ56qJyxQsjPKjeNBk3gdNjVsew5WhgTXZ1DYku'
    ]
  },
  {
    message: {
      id: '1lJ8EHyFgC',
      type: 4,
      protocol: 'eth',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhvzX8RpZEWGBYScu5vAPo7ufRYb447pzUgDYFohYurVQNFuqcHz3p5LzWmZCn1NfkyCG9WvgX',
      'FmwWgLpsoou4bxfwm59Vh1xUjCZZJBZ7BCxx14rrgjCHYVXwSH4BWYK23TfpF96bYA1w5MaYKeVGMzB127Uxd',
      '3tRVFxw8NhsyAxE8cizVpMgdKQan'
    ]
  },
  {
    message: {
      id: 'LP1sCbsmyT',
      type: 4,
      protocol: 'grs',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'PVttrMLstECaVRyXyKXNzZuakmHEUVA4gTUUmJvHufvqhiRhXk4sDStFdLMPjty3JTKkgBDcdECfQVef6xhA3A1NYLSVDJebBCZba9hzzWjaHaMb3XNY47NKXPmgcTcq3oDnFKAEHhJJGTfRvGKiWzWyMjSDZ4BMaqh7SyHEijgR9Tz3DhiH4BH9UZ4XnmLqsK3YHqUqKfB3vGPEZkKzQTxS'
    ]
  },
  {
    message: {
      id: '7shAOs6Xql',
      type: 4,
      protocol: 'grs',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHigRzNKDXHojNKTFfwwQoXXx8QzjnnuwkPJPUJuSEukd5eZKjZsjb5GBRdiV8n5rmNohSu261g',
      'FmwWgLpsoou6E9V8nXR5SdS8Tkt2jFBdJN5AfJJgP18WE3VjRZdyqQBY15mnwzYGB18pe6qm92PyrNfYWHznt',
      'FmwWgLpsvk1BqMA3svDbNRFxoA6sTeFY1aE6xS2QnfigJhDk7UTNMK7YVrwjkvz3DSNHzpZj6ENAe2biRDdMg'
    ]
  },
  {
    message: {
      id: 'wDxeoJzbC7',
      type: 4,
      protocol: 'polkadot',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '3d11L5MFzJ49DMJpwGVHs7ZhFoVts5n32HV55r7X5rJbARYJNiSFis9cDch1M3qcwZypE69hPcYXo6wHNpZnXFSVVtdyHEJoqCFGVYsKP8bJ9G2AH7T4qWdeUUUgVUt3BjjfGfzsvHbncQG7RMK8MdtSqMyUautwpK6iSv'
    ]
  },
  {
    message: {
      id: 'tZ4Df8w5hy',
      type: 4,
      protocol: 'polkadot',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHi1EKe5NWQ96JzwqU7R9m2G4aL8U3BtgDom35cR2qVzTpiFY85bF8UXTRgqF8MATLbwMmoV6Pz',
      'FmwWgLpsoou4bzo3SHb4uxDRij2HKk4Yi9JURsoxEHVCBZM2f9ZBkCnvDiMDTaPRHNNs5LGtp3wNVCkaCoCMZ',
      'LFhi4Jim1CSucAQ2PiXGtBGbxB1VBdx6z'
    ]
  },
  {
    message: {
      id: 'ypOgLVKMm8',
      type: 4,
      protocol: 'kusama',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '8oWwx6VEgkDxDwkjbrDaKtqV8tKjGrr8Kb37xsNorGCMDqdNRiUkxGZ39x9MEAyMoUAfXJa4tU7CWbGyJM9jXkWyfY9afwu7WMw3MHCaLHSySEWrMaWbmw5SopAZ7EN1WKg2VX42tqXu99fKAc4wuxCbiM9ZBaBXMR4'
    ]
  },
  {
    message: {
      id: 'DDcpocOwSp',
      type: 4,
      protocol: 'kusama',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhy7RPFbXqPdD3js4MjbYyoYYmnyVk9yeiHSz9mrRewfUW92nfkyC9HyhBekdJE8fEtRgYo5RH',
      'FmwWgLpsoou443mZHh3U7onRPdLi1DHD3Qzs1n1QkkoJqkNLqZvbLkizJ2zMkz8TG7YgSm6pAojRV3QvRySu4',
      'yn8ax9ANzLCdWCP522cauTjGDCupVi'
    ]
  },
  {
    message: {
      id: 'IFdjGO2eKP',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      '6GDUDKbtxw8oJvcGdDxxA2FRrdW93P8pFcMAqWAW2xXe1PDwpTMckdBSCFFQhDzRoFg7cJYPznsBwZBoKHT7kQ8tEDxpTJB7hDiS5P9otq8JPZcSP5MfCU9DP8emJ1gRRUHJtzMHCuMbuuMBx8k1y8h7TZDv2yQ'
    ]
  },
  {
    message: {
      id: 'EUD7whRc7n',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhuw511w4zSHbWy5MHsiXiK5SWuQ9FXvpvBYaNbtg1asegx1ziRPw1SdH8bTkTNadiSWchByC4',
      'FmwWgLpsoou4CZhkzT5BJTNpNvu3HsYYUtEhY7ijAzkrN1mtzH6SyPqmHXwCqdfSVxTKKgaT8KtW3iL8ZUszP',
      'ekR2AcRtRjKqmnakY9149sJNpT'
    ]
  }
]

describe(`Serializer V2, Message V1 deserialization`, async () => {
  testData.map((data) => {
    return it(`Protocol: ${data.message.protocol}, Id: ${data.message.id}, (full / chunked)`, async () => {
      const serializer: Serializer = new Serializer()

      const reconstructed: IACMessageDefinitionObject[] = await serializer.deserialize(data.result)

      expect(reconstructed[0]).to.deep.equal(data.message)
    })
  })
})
