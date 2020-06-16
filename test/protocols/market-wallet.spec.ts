import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as sinon from 'sinon'

import axios from '../../src/dependencies/src/axios-0.19.0/index'
import {
  AirGapMarketWallet,
  BitcoinProtocol,
  EthereumProtocol,
  ICoinProtocol,
  addSupportedProtocol,
  AeternityProtocol,
  GroestlcoinProtocol,
  TezosProtocol,
  CosmosProtocol
} from '../../src/index'
import { NetworkType } from '../../src/utils/Network'

addSupportedProtocol(new AeternityProtocol(), {} as any)
addSupportedProtocol(new BitcoinProtocol(), {} as any)
addSupportedProtocol(new EthereumProtocol(), {} as any)
addSupportedProtocol(new GroestlcoinProtocol(), {} as any)
addSupportedProtocol(new TezosProtocol(), {} as any)
addSupportedProtocol(new CosmosProtocol(), {} as any)

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocol = new EthereumProtocol()
const xPubProtocol = new BitcoinProtocol()

describe(`AirGapMarketWallet`, () => {
  const sampleResponse: Readonly<any> = Object.freeze({
    data: {}
  })

  const txList = []

  const getWalletWithAddresses = () => {
    const wallet = new AirGapMarketWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )
    wallet.addresses = ['address']
    return wallet
  }

  const getWalletWithPublicKey = () => {
    return new AirGapMarketWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )
  }

  /*
  const getWalletWithExtendedPublicKey = () => {
    return new AirGapMarketWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath
    )
  }
*/

  const stubCoinlibOfWallet = (wallet: AirGapMarketWallet) => {
    sinon.stub(wallet.protocol, 'getTransactionsFromAddresses').withArgs().returns(Promise.resolve(txList))
    sinon.stub(wallet.protocol, 'getTransactionsFromExtendedPublicKey').withArgs().returns(Promise.resolve(txList))
    sinon.stub(wallet.protocol, 'getTransactionsFromPublicKey').withArgs().returns(Promise.resolve(txList))
  }

  beforeEach(() => {
    sinon.stub(axios, 'get').withArgs(`https://url`).returns(Promise.resolve(sampleResponse))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should fetch transactions of ETH (addresses)', async () => {
    const wallet = getWalletWithAddresses()

    stubCoinlibOfWallet(wallet)

    const transactions = await wallet.fetchTransactions(1, 2)

    const txFromPubKeyStub = wallet.protocol.getTransactionsFromPublicKey as any
    const txFromAddressesStub = wallet.protocol.getTransactionsFromAddresses as any

    expect(transactions).to.deep.equal(txList)
    expect(txFromPubKeyStub.callCount).to.equal(0)
    expect(txFromAddressesStub.callCount).to.equal(1)
    expect(txFromAddressesStub.calledOnceWith(['address'], 1, 2)).to.be.true
  })

  it('should fetch transactions of ETH (public key)', async () => {
    const wallet = getWalletWithPublicKey()
    stubCoinlibOfWallet(wallet)

    const transactions = await wallet.fetchTransactions(0, 0)

    const stub = wallet.protocol.getTransactionsFromPublicKey as any

    expect(transactions).to.deep.equal(txList)
    expect(stub.callCount).to.equal(1)
    expect(stub.calledOnceWith('02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932', 0, 0)).to.be.true
  })

  it('should fetch transactions of BTC (extended public key)', async () => {
    const wallet = new AirGapMarketWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath
    )

    stubCoinlibOfWallet(wallet)

    const transactions = await wallet.fetchTransactions(0, 0)
    expect(transactions).to.deep.equal(txList)
  })

  it('should not create wallet with unknown identifier', async () => {
    try {
      // TODO: Pass an unknown protocol
      const wallet = new AirGapMarketWallet(
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
    const wallet = new AirGapMarketWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const address = wallet.receivingPublicAddress
    expect(address).to.be.undefined
  })

  it('should derive address from public key', async () => {
    const wallet = new AirGapMarketWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapMarketWallet(
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
    const wallet = new AirGapMarketWallet(
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
    const wallet = new AirGapMarketWallet(
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
    const wallet = new AirGapMarketWallet(
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
      addresses: [],
      dailyMarketSample: [],
      hourlyMarketSample: [],
      marketSample: [],
      minuteMarketSample: []
    })
  })
})
