import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { AirGapMarketWallet, EthereumProtocol, BitcoinProtocol } from '../../lib/index'

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
      protocol.identifier,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )
    wallet.addresses = ['address']
    return wallet
  }

  const getWalletWithPublicKey = () => {
    return new AirGapMarketWallet(
      protocol.identifier,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )
  }

  const getWalletWithExtendedPublicKey = () => {
    return new AirGapMarketWallet(
      xPubProtocol.identifier,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath
    )
  }

  const stubCoinlibOfWallet = (wallet: AirGapMarketWallet) => {
    sinon
      .stub(wallet.coinProtocol, 'getTransactionsFromAddresses')
      .withArgs()
      .returns(Promise.resolve(txList))
    sinon
      .stub(wallet.coinProtocol, 'getTransactionsFromExtendedPublicKey')
      .withArgs()
      .returns(Promise.resolve(txList))
    sinon
      .stub(wallet.coinProtocol, 'getTransactionsFromPublicKey')
      .withArgs()
      .returns(Promise.resolve(txList))
  }

  beforeEach(() => {
    sinon
      .stub(axios, 'get')
      .withArgs(`https://url`)
      .returns(Promise.resolve(sampleResponse))
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should fetch transactions of ETH (addresses)', async () => {
    const wallet = getWalletWithAddresses()

    stubCoinlibOfWallet(wallet)

    const transactions = await wallet.fetchTransactions(1, 2)

    const txFromPubKeyStub = wallet.coinProtocol.getTransactionsFromPublicKey as any
    const txFromAddressesStub = wallet.coinProtocol.getTransactionsFromAddresses as any

    expect(transactions).to.deep.equal(txList)
    expect(txFromPubKeyStub.callCount).to.equal(0)
    expect(txFromAddressesStub.callCount).to.equal(1)
    expect(txFromAddressesStub.calledOnceWith(['address'], 1, 2)).to.be.true
  })

  it('should fetch transactions of ETH (public key)', async () => {
    const wallet = getWalletWithPublicKey()
    stubCoinlibOfWallet(wallet)

    const transactions = await wallet.fetchTransactions(0, 0)

    const stub = wallet.coinProtocol.getTransactionsFromPublicKey as any

    expect(transactions).to.deep.equal(txList)
    expect(stub.callCount).to.equal(1)
    expect(stub.calledOnceWith('02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932', 0, 0)).to.be.true
  })

  it('should fetch transactions of BTC (extended public key)', async () => {
    const wallet = new AirGapMarketWallet(
      xPubProtocol.identifier,
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
      const wallet = new AirGapMarketWallet(
        'IOTA',
        '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
        false,
        protocol.standardDerivationPath
      )
      expect(true).to.equal(false)
    } catch (error) {
      expect(error.message).to.equal('PROTOCOL_NOT_SUPPORTED')
    }
  })

  it('should return undefined if no address has been derived', async () => {
    const wallet = new AirGapMarketWallet(
      protocol.identifier,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const address = wallet.receivingPublicAddress
    expect(address).to.be.undefined
  })

  it('should derive address from public key', async () => {
    const wallet = new AirGapMarketWallet(
      protocol.identifier,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapMarketWallet(
      protocol.identifier,
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
      xPubProtocol.identifier,
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
      xPubProtocol.identifier,
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
      protocol.identifier,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath
    )

    const json = wallet.toJSON()
    expect(json).to.deep.equal({
      protocolIdentifier: 'eth',
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
