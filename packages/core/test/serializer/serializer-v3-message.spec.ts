import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'

import { SerializerV3 as Serializer } from '../../src'
import { IACMessageDefinitionObjectV3 } from '../../src/serializer-v3/message'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

const testData = [
  {
    message: {
      id: 69483304,
      type: 4,
      protocol: 'ae',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      '4zgxrRJAamW6WXW2so48yduv6MH3PmY9wShcU6Wk8YnFqEMr7in2jfs859gyhv59EfWfigwExvXPvfzKyLNtT3E454AbRBaeSneHzYYydXftcPVebEAy5umejZ59HwqeoAeXftXTtjAkMRAb8NxkC'
  },
  {
    message: {
      id: 53322641,
      type: 4,
      protocol: 'btc',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      'G6U4dM3rqYrsbNtJCN7bR21jLLCpFF6m7XMwC2RBvsaUmsGfXaNr7v7Vf1KTvXTRpTjV1Ce1fWsMcieS26cP5K9TSyUTJjJGq1HwDcC2f1RBLgMMBpMaqtXmJS1n3uGrbfzD7t88fgGVQtAHKD2sP2oza2vnReFCK2n2HJcTsdfDTTEwWG5zyJhbnbiaNP1CYjcWrwkPhompnBbzcu3i4VZk1JXBgLQNE28dKPEuRKquxcPdvSEuv1h'
  },

  {
    message: {
      id: 21459834,
      type: 4,
      protocol: 'cosmos',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      '3x3mTuXcyyVBqtkMqL1xy1M8D4AwMrKms67pCHcCtw1H1etkqcMTCBZhkzUvaDbgB9be9bCXCSigL65aAYsRAxFP4FQWrbaDeVMwxZKRDwfhvGgVdsAb5rptU3Q34Q3hUHL5578LLbRSXpiKeaxaFEyaxRKxTYCW'
  },
  {
    message: {
      id: 66930123,
      type: 4,
      protocol: 'eth',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      '2LpfcPxwkWDgnKsCXYUkxBtFTiLbt1jx6cUHvwVTzUXFbVYrnfvgJWhC2idWjYyWUuFSfJQYgiWfcC4zLZTH8uvy1aomuwsD4ih7nMVtKeWfCkjNdUXMcdeNf1zEbR23p64bVinFmcFQLVks38acthsF'
  },

  {
    message: {
      id: 42111394,
      type: 4,
      protocol: 'grs',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      'PNvHdBSAuq8ygr1cWFYUf7rZKoyiK9rRsUqqVBh9PaagvFv6VbdPZ6MqwT2XeBos4nGcdNmgLrZvRLPMMt9BhYEyUTRdWM1cxLhxLcJyQaV5VVnmB561HDusb1vQQJfs3ZP8iuskAeNc3rCqJvhWg7Gq6U9SDpAXXog3WXvidtoDF2GMxkjLwZUHxjx84otGZ8jGovktBR9C4YneMuUBvSRrey5gCWh9AimewSSLPLeg8V5d25m2vvATAx4'
  },

  {
    message: {
      id: 95324935,
      type: 4,
      protocol: 'polkadot',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      'fkg5HS4d21x27HczAkGQ7WU3Jr6G6vfRJ3dCQdVywNZKhgnVtUV3ZZEpuuakgTq5524fzm2vCDY6oQzymDKGSFhpbeudmPyuCCkMDHeCp9vCMtZzNnpmgt5mbA8B8hi352GYzKeeaaC9mfRrLFEGtKyaX7EjaH'
  },

  {
    message: {
      id: 53523494,
      type: 4,
      protocol: 'kusama',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      '2zNiMoXdkuyBq6YL4Se1uatEsJpr1MeiThcKQaVZagndG52rTxD3Tf9uNWZRKhd19fHqCpDL38oV4zW3PQZ7S3CyU3TNuF687vuVXKZZKdVdDXqs2GDi62hAsDd2maqtmWvDX2cPbnNZJQZtRsPH27pVXoVK'
  },
  {
    message: {
      id: 52348539,
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false,
        isActive: true,
        masterFingerprint: 'xxxxxx',
        groupId: 'yyyyyy',
        groupLabel: 'My Secret'
      }
    },
    result:
      '2LpfcPxwkWDgnKsCXYUkxBtHA9UNwCrbVjcc83EWoi6mtRmVms2eMUcDzWw2Y1ZkAB1hv7SuaSs11Pds9URkNsRZHft7SmqQvEzY6ssKRru4iTJ7Tf5sSGryrK3X6z8D3g9kxwZ8wW87vLaTxBYMkVVT'
  }
]

describe(`Serializer V3, Messages`, async () => {
  testData.map((data) => {
    return it(`Protocol: ${data.message.protocol}, Id: ${data.message.id}`, async () => {
      const serializer: Serializer = new Serializer()

      const reconstructed: IACMessageDefinitionObjectV3[] = await serializer.deserialize(data.result)

      expect(reconstructed[0]).to.deep.equal(data.message)
    })
  })
})
