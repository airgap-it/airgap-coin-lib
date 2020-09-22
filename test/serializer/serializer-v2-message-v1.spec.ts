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
      id: 'U9HkbF1XYn',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      '2mXFjLsehbg348iPPKKexLjckDyqNP716QMN3YiDCLyT6qaiGqMRa4b2UCVhwTNVcBXqrxSniLGT1gLjRnhpSvVktQkZoJ43xhnGUq4wxYeUxtVpEt4qJxz7Qs7YbFGsDtogDVFxRoLQNcfj2GHBKAWc4DbY8a3wnC'
    ]
  },
  {
    message: {
      id: 'Vae4TmnNXh',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '3874b66ba5d9649082526b39260626796ec2a7364d07cc9bc44b7ca62414166b',
        derivationPath: 'm/44h/457h/0h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhx3yFqi3UtZBRWBY9Eb9DYQQrcndaMfusA3FQAZqHssNu2Dg1k6AUewop6DKWioXkXwRx7veC',
      'FmwWgLpsoou3sumYEDppbngV8RumTnCHpMs17DneRpo6tmmuBXmTWg2qGo1wc68u8AdzPk5CQyb8E5PR64868',
      'DoXwU3bDgPDF4cXWycSXWBtrJyHYa'
    ]
  },
  {
    message: {
      id: 'v80rVBtozK',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      '66ds3Rvy92D8gFdA3j42UZD42SeAm5MyjXLCnKva8rHgq74gK7jAtMVJdx6ayzVmEcnPUeeFYPmyW5aevxAr7SvRRfDFoKkJJukupcZfDeuQrodzPjMNKXXcey2wqRvA3X2m1PPXAZLnpjrLFGHioFNcKhE52BHDEUdZ94g3UBnWT3KBUcxC1vaK1beETtStWrynEviFBfhTS93S4R2Bok4'
    ]
  },
  {
    message: {
      id: '41OnmrBZfp',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6C8QAa1sHBz38wamg7f1MaF3hrGy9PbASdZ9agpYDYS8DQnYDdhQN458iVQBWpVbCgadtg65E4xLpjPoV2uxTiNdf3PnziySrWnoCauG2PN',
        derivationPath: "m/44'/0'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHifNYEuL33io5axmAxFs6KFYwnAhQD3uKxB3TsJ28BuB2Fk7YcKzngdx8EKjLKEMQ8HZoyTyPL',
      'FmwWgLpsoou3xySMq2nfg3RczkmsLYtTqwoYHjhKcjvP7C4ijBUGzY9Fn5KahqvfthjdA4YxMbPhbQj2XJtdG',
      'kojrhCZHPKEYxUoLPYbEASuwbTdSychmxswR2efjwF1k7WEQcUMX6qnDNJQujg4aN6SBDSU9iL2tLPvDTR'
    ]
  },
  {
    message: {
      id: 'gK6aiOIA6M',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '2mXFjLsehbg348iPPKKexLjbEPyYXCsAcRJ168Z6Du9igy35ac2vt8MuaML18inpAPzQJfa2ZjSkhVhmiCJvdF2im5RBmK6u59wW6YrHJfSG5vPyu1KwJKUGLFA7ARb896wQNHHa1HKLUf7hgKtMaU2HEK7gWtno29'
    ]
  },
  {
    message: {
      id: 'd8Y0RvaQHn',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '020c4a25d3a5526691c097eff7e9c44bcdd25ba982c7d6704e05eee88e83f61d61',
        derivationPath: "m/44'/118'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhx3yFqi3UtZBRWBY7JJWEDBtC5hheeZjKRAST6H8nVephRsU2SUj1kDhsis3tvnPsFfcQXxo5',
      'FmwWgLpsoou3yNYUYxcBEwSbnK51uzia3CE2KHBvdT1iPNtux9e7tnjMoK8jpxNdQEpoXPKKij2fgGVvUqQEy',
      'DoXwU3bDgPJLAQf9ys9tb6UXhTidU'
    ]
  },
  {
    message: {
      id: '1az8tE9qC8',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'QEBGNJUDkpZevtitv8LPSLk2128gqemcrYjhpy4d5pj992qZRaEc1BPHppsapA5M67gexMrP4gbD1tPAULfB2xQhKUHJGQjjzXQ3Vnk9BSybw4h41PRXhq6xUbwwwsojCCdaVCHARv8GB9xNGmoZh98rhkXHWMEX'
    ]
  },
  {
    message: {
      id: 'K0VY46x3P2',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '03d79f5ab62e51c7b2960a204e81714826867fa030b1cd74b6ec9931995f130795',
        derivationPath: "m/44'/60'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhvzX8RpZEfRPUEdSgcsCUbXQ2Ef2aYsVKf8FTij7iQY1n8xk1pFKsLicX2oA7TiqEufFv2cua',
      'FmwWgLpsoou4bxfwm59Vh1xUjCZZJBZ7BCxx14rrgjCHYVXwSH4BWYK23TfpF96bYA1w5MaYKeVGMzDvuPdZ1',
      '3tRVFxw8NhnyYZ9SabsKKHoqUdwR'
    ]
  },
  {
    message: {
      id: 'EtbwZ7otsQ',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'PVttrMLstECaVRyZNtRLzC2CpcbwHE7g2iPm9BFNBLPpnMdn7BTSEJLw76u2smaYhSGCE2X5vUP7TAYQHCYpR436MKtByNSRGHWSxwJbTMcTCiv2bWeavZ6mzgY3hm6nTXZJqJSyw5ZSvvBhE119xSbDucsKmZJoBZy35H5Yu5bihdpVjStEyzs4eVEbKTShykraZB1nvSMYx7akCZMm4uXq'
    ]
  },
  {
    message: {
      id: 'BPMEYSXsXw',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'xpub6DFzZR4RHVHG3A16dwMZWYYXTwg5dxerVFtpQFTixfhidujP9XqAeWkGPaH8LhPGpm4Dv3WgpBcrjsqxqhzdr39ZgvTdQzQPjE48u8hxciJ',
        derivationPath: "m/44'/17'/0'",
        isExtendedPublicKey: true
      }
    },
    result: [
      'FmwWgLpsgsoHigRzNKDXHwvsYEKGNwJQ4sDRx2M8mzwdwRUYWTqXFX4jF4DCne7T34qADLMBWVhXqBqWqz66B',
      'FmwWgLpsoou6E9V8nXR5SdS8Tkt2jFBdJN5AfJJgP18WE3VjRZdyqQBY15mnwzYGB18pe6qm92PyrNfYWHznt',
      'FmwWgLpsvk1BqMA3svDbNRFxoA6sTeFY1aE6xS2QnfigJhDk7UTNMK7YVrwjkvz3DSSHdA4uBPHTHdFC2NHSi'
    ]
  },
  {
    message: {
      id: 'ixWBIYCLQn',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '6GDUDKbtxw8oJvcGdDxxA2FRrdW93J4avRedD3BsLRouB8HphjX3BrQdsPWMR5V1gMY4wgTsBMNFWxuVeho4PkMtZWhgAHjwtEAcdfmhe1bigYfDfH3ZkrHeKJupgqp1KBFXhfAXCh59DmNWpoHimtBZBY2GiNK'
    ]
  },
  {
    message: {
      id: 'TZcLcVuQOE',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '62af6bc3692698152918c618c9e9f995972ac299654d404998d6ec8055f6272c',
        derivationPath: "m/44'/354'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhuw511w4zSHbWy5MHsiXiK3GAX8bnTCazoSwpQaFWxHS2SbxQNKm7Yy1hB8GYQ5rxxQab5n2M',
      'FmwWgLpsoou4bsQct2Qe4dxCY6hfZiue8AXRsb8iW1PsTrLo33wi28e6UXJ1rAiMyZkwjP13A7xmPv2SVkv3j',
      'ekR2AcRtRjurtZvcMZpaSakkrB'
    ]
  },
  {
    message: {
      id: 'FSOIcpTXOK',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      '6GDUDKbtxw8oJvcGdDxxA2FRrdW93J4avf2A2VtFo8prdyUjsVxvrnioqZFhzokKiqojQoBzJK5bxkSFrTN1fj6az4Am2uxtA5Atyz4r6oz64LfY3J9KLcXQTzE9mQo8zgv7fLc9QoWBQEYG9jpcPgGjiFsJzny'
    ]
  },
  {
    message: {
      id: '384ql15W9b',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: 'dc17d447b04b542c082177e9e499db2f474a41e772e43f5f1fd3a8fc1e3b332a',
        derivationPath: "m/44'/434'/0'/0/0",
        isExtendedPublicKey: false
      }
    },
    result: [
      'FmwWgLpsgsoHhuw511w4zSHbWy5MHsiXiK3GAXELpcdxe3rwQ5U7XpbPEMQDjt7AGCsJabmiUdjDDvi88mL9F',
      'FmwWgLpsoou4XDDGKARaDgcNbHgAhCxozyU5HyXQgcXRALZGzuSFKTtnuQa4UWHvFRz4CACtBYVNF7BQ4k4HP',
      'ekR2AcRtRj2aSSWDkVZzQRmfTh'
    ]
  },
  {
    message: {
      id: 'MstTTbDRjZ',
      type: 4,
      protocol: 'xtz',
      payload: {
        publicKey: '2f26a220a7943c67245e17b08335e9a76378868e33d1911c70000b32a36c05da',
        derivationPath: 'm/44h/1729h/0h/0h',
        isExtendedPublicKey: false
      }
    },
    result: [
      '6GDUDKbtxw8oJvcGdDxxA2FRrdW93P8pFcMAqWAW2xXe1PDwpTMckdBSCFFQhDzRoFg7cJYPznsBwZBoKHT7kQ8tEDxpTJB7hDiS5P9otq8JPZcSP5MfCU9DP8emJ1gRRUHJtzMHCuMbwSPmLkWaLYe7hcxuiUh'
    ]
  },
  {
    message: {
      id: 'ktEQfZyLXo',
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
      'FmwWgLpsoou4CZhkzT5BJTNpNvu3HsYYUtEhY7ijAzkrN1mtzH6SyPqmHXwCqdfSVxTKKgaT8KtW43KAfJsf1',
      'ekR2AcRtRjM3ghv19EDCakCJ9h'
    ]
  }
]

describe.only(`Serializer V2, Message V1 deserialization`, async () => {
  testData.map((data) => {
    return it(`Protocol: ${data.message.protocol}, Id: ${data.message.id}, (full / chunked)`, async () => {
      const serializer: Serializer = new Serializer()

      const reconstructed: IACMessageDefinitionObject[] = await serializer.deserialize(data.result)

      expect(reconstructed[0]).to.deep.equal(data.message)
    })
  })
})
