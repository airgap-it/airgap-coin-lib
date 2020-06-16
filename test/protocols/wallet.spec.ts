import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as sinon from 'sinon'

import axios from '../../src/dependencies/src/axios-0.19.0/index'
import { AirGapWallet, BitcoinProtocol, EthereumProtocol, ICoinProtocol } from '../../src/index'
import { NetworkType } from '../../src/utils/Network'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocol = new EthereumProtocol()
const xPubProtocol = new BitcoinProtocol()

describe(`AirGapWallet`, () => {
  const sampleResponse: Readonly<any> = Object.freeze({
    data: {}
  })

  beforeEach(() => {
    sinon.stub(axios, 'get').withArgs(`https://url`).returns(Promise.resolve(sampleResponse))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should not create wallet with unknown identifier', async () => {
    try {
      // TODO: Pass an unknown protocol
      const wallet = new AirGapWallet(
        ({ identifier: 'IOTA', chainNetwork: { name: 'MainTangle', type: NetworkType.MAINNET, rpcUrl: '' } } as any) as ICoinProtocol,
        '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
        false,
        protocol.standardDerivationPath
      )
      expect(wallet).to.undefined
    } catch (error) {
      expect(error.message).to.equal('serializer(PROTOCOL_NOT_SUPPORTED): ')
    }
  })

  it('should return undefined if no address has been derived', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const address = wallet.receivingPublicAddress
    expect(address).to.be.undefined
  })

  it('should derive address from public key', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from extended public key and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
  })

  it('should derive address from extended public key with offset and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath.substring(0, xPubProtocol.standardDerivationPath.length - 1)
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
  })

  it('serialize to JSON without circular dependencies', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const json = wallet.toJSON()
    expect(json).to.deep.equal({
      protocolIdentifier: 'eth',
      chainNetwork: {
        name: 'Mainnet',
        rpcUrl: 'https://rpc.localhost.com/',
        type: NetworkType.MAINNET
      },
      publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      isExtendedPublicKey: false,
      derivationPath: "m/44'/60'/0'/0/0",
      addressIndex: undefined,
      addresses: []
    })
  })

  // TODO: Test address index with Tezos KT Addresses
})
