import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'

import { IACMessageDefinitionObject, Serializer } from '../../src'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

const testData = [
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      '2cervBwKDgab7dYghELbogqDoz6kxk8bCnwVr2cCQeaAUZC73pVWc2Q91cWQjVvG1Xqfakth5xBVSHrokhdb86H6xdtcKQnJjZiCuGVWB5v6XYcUSVXeF1CqHj4pom3sym8uuu5cy3jzX1bdzNo'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoZw7WCZ6JS4MkFFrkEHn4Ajq2QEJEk83qAaqAhw93CHdcTwhK7tAKZBta2hCu6x9nc6eXavNd',
      'kojrhCXhvkv5exe5pL6oyaZfLdHXVkYV7rTogxrj7B8xuz5fj5gJejrxc3NyErpN7L3vgDd5kEppF3RXfq'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      '5f4YF67Jfi4qfWP7T4Sh5bmyxnd9jSu4yWBU2Ym4vmnHHyDDnccNoBc9hbkQe4oPFr2GUUeyYXYMNm5qQLFbNDNVFhpwGj5C25sNPtPo1hCUM74SqGrTPYo5GmGoirrpC84A35zBPw33XWeFmhB3ff4pdboeNFW4W1qcWJpeBvh87A54HpFahhdUHvXawN129qpYs2t5'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHiTiaqMrEKs5SjwxPoJSg6AHEb5CEbsxW98TfjEsv8YAwAnJW9yEonmdnj4XAZ2NNmYwum52ot',
      'FmwWgLpsoou3xySMq2nfg3RczkmsLYtTqwoYHjhKcjvP7C4ijBUGzY9Fn5KahqvfthjdA4YxMbPhbQj2XJtdG',
      'fF3vrSs8swCuXbRLfAGqkJqmB19pLtxDdNJBuMGTqH4hDFfce5KDtCPqRGgoL3qbmyA'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '2cervBwKDgab7dYghELbogqCRjxWSrEw98Sw78o88wHtvAv5n8dibG7kvgVUfrtyRbuYKFoxNvZ3YygXmW5wasPa6RrYcuZqegbggUNUjaiF6nzq8hLM3cfUDg3DSE2GcaP9fKXbHsoDP9WwYzU'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoZw7WCZ6JS4MkFFriJ194qXJMs9NK31sHRi2DdeSXp55QsbVKpGireTndfLwHJw1uKpnGXMRT',
      'kojrhCXhvkwKRaWYjCYSrMa653res7SL8zSTcireAwRsH4LJrUsfCaTy5s1R8134w6G5ZuLiKfd5Y5tdLJ'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'NDdvRykiZcgZDjPKrLxp6vFqBVNePL8ehjwvnW4i5EffB5CAxvvZBih3doZDxopQge2tw4GdCAbnDSvmYCr5H6rFSM9838wM3iPqe5GSveWFgWegfK2DAaocyxEEBvHPi6PVKdfbSfR81XbLd'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoYsfNnfc4CvZnyhmHcZqKDrpC26hEwKdHffqEG6RTixGVagmKC3KiExhGyH3VqsTGypP3RqD3',
      'AtJqRLnpuJdcwtV2HhheusbRVEvAS4ZC7K8GP1wzaN9tpwtDoWakuDzbs6Ueongdz2UAMxB9tqD18hAUN'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'MZ1hvMj9jMSXcYwZk3iogGHTnPpnT7xya3zDeioK59KYEdpL2VpE1PFSQqXTWm6zbsKv5Gj4KugXmSHw5YwT1A4LzZa5MbcPHDZdzS3bxx3XQApFLAszaqiB2VNuwoK2jYFKfVKaiabGydFjDdjVSSZRbLbNNSfmFcRTvPMsSyCRAmToo4ZBr6Vo2MpxLKMSTLMFrVqNQ'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHiUn2xmjia6DEhDWVDysyqmwikvqyApzp8NtkNQhKCA4eA6QALHMU9CWpi591kHiWUTDgraJGB',
      'FmwWgLpsoou6E9V8nXR5SdS8Tkt2jFBdJN5AfJJgP18WE3VjRZdyqQBY15mnwzYGB18pe6qm92PyrNfYWHznt',
      '3vWTx4y3CqmzK18JsyqjhhgZz9983LrjN35QWyVqQx54h7x7wogUNmD9P9tHW8zCrShMr'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '5op5c6ufhBzafCMERhTpzNT6NTq3Rxx2vFiH2AAEzJjMDw3YuDZqVBb4L7hVTmcqDit77nYsy8JGTNHPp63cRGYL15StPpzDL84zA7JWBC5HbPmNwgvuRfg3YH7DhBfjGUnc4S7EcuCYZMXA'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoXpDFNn7oynmqi9ftsRAYwNgLJaGSqeixozXawwZGGhgjtKyhk7kxTD6T7c9vnEV12ZdxJYZv',
      '3EN264ymrRziDC5oZpNo1K44XnzpXkWuYyy39KNiq2QHZxKYHiiSbstFR3QshcvkYvKS8QbMyL4V4xbE'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '5op5c6ufhBzafCMERhTpzNT6NTq3Rxx2vTvqnXYUoBsbTiFQDQvb6A7Ya912mHWkVigNUeWia8Bfi7up56sXo27ezenuiC6qudNFRZKfYJTR5Ga15mMXgfVgUHAkqUU9UuZ4KUsYNBpKZ6Yb'
    ]
  },
  {
    message: {
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgrEBoXpDFNn7oynmqi9ftsRAYwNgLJg1V166c4QXAcqRH91dwo8F3FuA777PLYFbs1sqFzsKyt9Fq',
      '3EN264ymrRzf4wWSwzqKLNREgfH3EXYwpRK9VhCSE4UQLnrdNcz1yoVrasTK9mnxCN6zs6x336QiQHj5'
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
