import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { IACMessageDefinitionObject, Serializer } from '../../src'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

const testData = [
  {
    message: {
      type: 4,
      protocol: 'ae',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'NDdvRykiZcgZDjNx5APzGRFLiELmSEQpfKEJea8YiRZPFtpL1mNP14tJoFc6LGxrgmE5v8sTCoBvsgQdhqdjf5wbWnKgXsdZrapdXCkm3yHWuXUcZb5erBVXzC5trquqDE95PBqTfL94zhHyx'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'ae',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoYsfNnfc1tQkxigCj2GScWYV1xQHTMrHbDWv5TS8fKjgTaoMgjbnHT2G1Ek2vuHXYXgjBgacd',
      'AtJqRLnpuJdNoqzPMdenWkDVqtYSeJDV1dtskzDA4HEM68XaHNJufi9BehmjqGfPhypf4VKsPiU5izYGP'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'btc',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      '5f4YF67Jfi4qfWP75DhKjyZ1TY2oLR7NcuM4zhAbom6qbvpTJYQQQq6SUiWHYu9WBhXNbUwc1KQuE6mN63JaMqkL7nw9gR2DRn2siCZnuD1wtwXMmeRF4dYVts5NSYgNmXp76ZL9nVV98fBDEMK8xsANTXi43J8DFzRufMmn2XhyqM2tUu4u1wct9m26m2Bfs77TyJ5D'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'btc',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHiTiaqMrEKgUN2z81nQyKZh85nWhyWR5HrQrQbYhS5HGKJ3CSecHoPuKygSB2H39mBhfgVHJYu',
      'FmwWgLpsoou3xySMq2nfg3RczkmsLYtTqwoYHjhKcjvP7C4ijBUGzY9Fn5KahqvfthjdA4YxMbPhbQj2XJtdG',
      'fF3vrSs8swCuXbRLfAGqkJqmB19pLtxDdNJBuMGTqH4hDFfce5KDtCPqRGgoL3qbmyA'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'cosmos',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '3PrMnoUCzvLG39kMCNkeqLQ7TzPvCqYHd5sQ4Gvuo29WvdogaRnEKuLtegpx89NYnwpjUZJ4uiiW9v2Uo3y7Cq1b5mU49mmo5zdZ4T1PdW3HJHK1X6GKxchLr7CZSbFSG4UznubhvK1HiJPWV3TaPus'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'cosmos',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhoaNEXthbvJqh3nYPBkxutbG5dZWxZKSU9Ro6Qf6cATZc1nY3KVq4emZJGmXg12mSGDMVt8K9',
      'FmwWgLpsoou4Mw2p5npwqBjqcGmfNx96bofgKTkSGUK6x341GzznyzjykHHHuAjNAHNo1hK2FQbG4tE1L2Pgv',
      'Hg8rBB6q6C6xkj6XMd'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'eth',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'NDdvRykiZcgZDjPJNLZW7tA7UtR9vdx8m54Nc67dpJpthN4h4hxG6EHe9wxP68ni3QJWN9QwrtKg6Q8tZDVfUZQzJwzuuo8u4Ux7Zo39HYLDSXzxEM89aNZQtXAU5VBHk3z2wTAvBEvJ4bBz2'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'eth',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoYsfNnfc43mMsBhDgus2dkF5bL2iiWH8Sgm82M4rfAuf5hdrufn3eyb5Gi36APXHo3MVVnNtD',
      'AtJqRLnpuJdcwtV2HhheusbRVEvAS4ZC7K8GP1wzaN9tpwtDoWakuDzbs6Ueongdz2UAMxB9tqD18hAUN'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'grs',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'MZ1hvMj9jMSXcYwYTXLLgmkFqkDKHaDnioPPWeHWB7V6RdeMsE8xc4nhekmuAi65Pa9iZB34He2go3yrdEj8bzT5nccdk2meVno5UdP2CoRHenKp4FTRUBLoST3Pz8RfetTsAxszzf9i6m78kiXcVtbm3qYW6Cb5ujkP1oSwapiGKEqpU8DTTp5r7XBGF9B4TeYzcXwRE'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'grs',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHiUn2xmjiZx1jUSStnyzPJSgRDuEdBjzvaFogArJ2rPczZbWh7WycBPs68TGy1ssk255adi9Af',
      'FmwWgLpsoou6E9V8nXR5SdS8Tkt2jFBdJN5AfJJgP18WE3VjRZdyqQBY15mnwzYGB18pe6qm92PyrNfYWHznt',
      '3vWTx4y3CqmzK18JsyqjhhgZz9983LrjN35QWyVqQx54h7x7wogUNmD9P9tHW8zCrShMr'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'polkadot',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '3PrMnoUCzvLG39kRpVYvHtPSPaKM4VzPSncu9KNEB5SoAFYLg5urNqe4Vs174SPoiqW9mfyxWTKKiUqdv9pt8WwnMf4WNNtRXW9fk4M28F9KuBqMa4Ef7MGA42WcijtX3dM5zJ9f2HysSNSab4Pbvqy'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'polkadot',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhoaNEXthgHNg9w2gxTjLoAns92xsaijPziTHUMtdSdTjdHj5dEV9af96Ba2xaxUKFCjsYsB1F',
      'FmwWgLpsoou4bzo3SHb4uxDRij2HKk4Yi9JURsoxEHVCBZM2f9ZBkCnvDiMDTaPRHNNs5LGtp3wNVCkaCoCMZ',
      'Hg8rBB6q6C54uqjH2b'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'kusama',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '88NVC6aU2DpZxXp9AM7pz1P3B2ZDsTNPUC9BMz7MCea5xMbv9dpbWhsEnJyZ1G5zpdUZyFb8SWU4BBh37G6ozydP4JzuwG2jWofDXxpCzvKxHemCEn7roRNMqhrYDcRBm7kvTN8hNZxwst7NG5Mz'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'kusama',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoazZdcSaew8PNUwNxjJBpRsxwaRAQYRngHzZvKDjQG5jDakoy8mBzCDmwbEWgcHHGxaqCvFTZ',
      'FmwWgLpsonKx9sJewbNKfD1EZPDomAQG78bzNexF2KCGcoVikAS79S9L6SXRWigRzt76hxnsKPs4srBxsQQSW'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      '5op5c6ufhBzafCMERhTpzNT6NTq3S3arg2k3jxEWMvCHPY6ZU88W5Qtym5Vbv4GafxDN952udKyKaiQTTWGSzsw3jJ8Tntq37WwXSKk2PL5UcBbrk4UCD6SZ8fWdtxVTF5of9r8pr8ZDfLqV'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoXpDFNn7oynmqi9ftsRAYwQrggqouvNxtC6A99FykuHuQPk21oBvrLsMtXwdqkjFkWfiue2X2',
      '3EN264ymrRzSVSpVgu1a1cwgjY1zpNu4YT3CoGPH2MMb6GLo1RqEuNnXY9NZiSi9xbD8oFrFYs6Hr9Ht'
    ]
  }
]

describe(`Serializer V2, Message V0 deserialization`, async () => {
  testData.map((data) => {
    return it(`Protocol: ${data.message.protocol}, (full / chunked)`, async () => {
      const serializer: Serializer = new Serializer()

      const reconstructed: IACMessageDefinitionObject[] = await serializer.deserialize(data.result)

      ;(data.message as any).id = reconstructed[0].id // The old serializer doesn't have an ID, so a random one is generated

      expect(reconstructed[0]).to.deep.equal(data.message)
    })
  })
})
