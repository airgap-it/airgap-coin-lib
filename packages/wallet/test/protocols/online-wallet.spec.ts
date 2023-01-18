import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapOnlineProtocol, protocolNetworkIdentifier } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { AirGapCoinWallet, AirGapOnlineWallet, AirGapWalletPriceService, AirGapWalletStatus } from '../../src/index'

import { MockExtendedProtocol } from './mock/MockExtendedProtocol'
import { MockProtocol } from './mock/MockProtocol'
import { MockProtocolOptions } from './mock/MockProtocolOptions'

const mockProtocol = new MockProtocol(new MockProtocolOptions(undefined, { standardDerivationPath: `m/44'/60'/0'` }))
const mockExtendedProtocol = new MockExtendedProtocol(new MockProtocolOptions(undefined, { standardDerivationPath: `m/44'/0'/0'` }))

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocol = mockProtocol
const xPubProtocol = mockExtendedProtocol

class AirGapPriceService implements AirGapWalletPriceService {
  public async getCurrentMarketPrice(protocol: AirGapOnlineProtocol, baseSymbol: string): Promise<BigNumber> {
    throw new Error('Method not implemented.')
  }
}

describe(`AirGapCoinWallet`, () => {
  const sampleResponse: Readonly<any> = Object.freeze({
    data: {}
  })

  const txList = { transactions: [] }

  const getWalletWithAddresses = async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )
    wallet.addresses = ['0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f']
    return wallet
  }

  const getWalletWithPublicKey = async () => {
    return new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )
  }

  const stubCoinlibOfWallet = (wallet: AirGapOnlineWallet) => {
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

  it('should fetch transactions of addresses', async () => {
    const wallet = await getWalletWithAddresses()

    stubCoinlibOfWallet(wallet)

    const transactions = await (await wallet.fetchTransactions(1)).transactions

    const txFromPubKeyStub = wallet.protocol.getTransactionsForPublicKey as any
    const txFromAddressStub = wallet.protocol.getTransactionsForAddress as any

    expect(transactions).to.deep.equal(txList.transactions)
    expect(txFromPubKeyStub.callCount).to.equal(0)
    expect(txFromAddressStub.callCount).to.equal(1)
    expect(txFromAddressStub.calledOnceWith('0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f', 1)).to.be.true
  })

  it('should fetch transactions of public key', async () => {
    const wallet = await getWalletWithPublicKey()
    stubCoinlibOfWallet(wallet)

    const transactions = await (await wallet.fetchTransactions(0)).transactions

    const stub = wallet.protocol.getTransactionsForPublicKey as any

    expect(transactions).to.deep.equal(txList.transactions)
    expect(stub.callCount).to.equal(1)
    expect(stub.calledOnceWith('02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932', 0)).to.be.true
  })

  it('should fetch transactions of an extended public key', async () => {
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      {
        type: 'xpub',
        format: 'encoded',
        value: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    stubCoinlibOfWallet(wallet)

    const transactions = await (await wallet.fetchTransactions(0)).transactions
    expect(transactions).to.deep.equal(txList.transactions)
  })

  it('should return undefined if no address has been derived', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const address = wallet.receivingPublicAddress
    expect(address).to.be.undefined
  })

  it('should derive address from public key', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f')
  })

  it('should derive address from extended public key and save it in wallet', async () => {
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      {
        type: 'xpub',
        format: 'encoded',
        value: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV'
      },
      (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x6c9d0bc4aebc2482eaee234ad34c4cf216b890b6fdace224db13059596a7744a')
  })

  it('should derive address from extended public key with offset and save it in wallet', async () => {
    const derivationPath = (await protocol.getMetadata()).account?.standardDerivationPath ?? 'm/'
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      {
        type: 'xpub',
        format: 'encoded',
        value: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV'
      },
      derivationPath.substring(0, derivationPath.length - 1),
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x6c9d0bc4aebc2482eaee234ad34c4cf216b890b6fdace224db13059596a7744a')
  })

  it('serialize to JSON without circular dependencies (HD)', async () => {
    const [protocolMetadata, protocolNetwork] = await Promise.all([protocol.getMetadata(), protocol.getNetwork()])

    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      protocolMetadata.account?.standardDerivationPath ?? 'm/',
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const json = await wallet.toJSON()
    expect({ ...json, priceService: undefined }).to.deep.include({
      protocolIdentifier: protocolMetadata.identifier,
      networkIdentifier: protocolNetworkIdentifier(protocolNetwork),
      publicKey: {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      derivationPath: "m/44'/60'/0'",
      addressIndex: undefined,
      addresses: []
    })
  })

  it('serialize to JSON without circular dependencies (non-HD)', async () => {
    const [protocolMetadata, protocolNetwork] = await Promise.all([protocol.getMetadata(), protocol.getNetwork()])

    const wallet = new AirGapCoinWallet(
      protocol,
      {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      `${protocolMetadata.account?.standardDerivationPath ?? 'm/'}/0/0`,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const json = await wallet.toJSON()
    expect({ ...json, priceService: undefined }).to.deep.include({
      protocolIdentifier: protocolMetadata.identifier,
      networkIdentifier: protocolNetworkIdentifier(protocolNetwork),
      publicKey: {
        type: 'pub',
        format: 'hex',
        value: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932'
      },
      derivationPath: "m/44'/60'/0'/0/0",
      addressIndex: undefined,
      addresses: []
    })
  })
})
