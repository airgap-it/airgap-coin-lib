import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as sinon from 'sinon'

import axios from '../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  addSupportedProtocol,
  AeternityProtocol,
  AirGapCoinWallet,
  AirGapMarketWallet,
  BitcoinProtocol,
  CosmosProtocol,
  EthereumProtocol,
  GroestlcoinProtocol,
  ICoinProtocol,
  MainProtocolSymbols,
  TezosProtocol
} from '../../src/index'
import { EthereumProtocolOptions } from '../../src/protocols/ethereum/EthereumProtocolOptions'
import { AirGapWalletPriceService } from '../../src/wallet/AirGapMarketWallet'
import { AirGapWalletStatus } from '../../src/wallet/AirGapWallet'

addSupportedProtocol(new AeternityProtocol())
addSupportedProtocol(new BitcoinProtocol())
addSupportedProtocol(new EthereumProtocol())
addSupportedProtocol(new GroestlcoinProtocol())
addSupportedProtocol(new TezosProtocol())
addSupportedProtocol(new CosmosProtocol())

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocol = new EthereumProtocol()
const xPubProtocol = new BitcoinProtocol()

class AirGapPriceService implements AirGapWalletPriceService {
  public async getCurrentMarketPrice(protocol: ICoinProtocol, baseSymbol: string): Promise<BigNumber> {
    throw new Error('Method not implemented.')
  }
}

describe(`AirGapCoinWallet`, () => {
  const sampleResponse: Readonly<any> = Object.freeze({
    data: {}
  })

  const txList = { transactions: [] }

  const getWalletWithAddresses = () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )
    wallet.addresses = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']
    return wallet
  }

  const getWalletWithPublicKey = () => {
    return new AirGapCoinWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
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

    const transactions = await (await wallet.fetchTransactions(1)).transactions

    const txFromPubKeyStub = wallet.protocol.getTransactionsFromPublicKey as any
    const txFromAddressesStub = wallet.protocol.getTransactionsFromAddresses as any

    expect(transactions).to.deep.equal(txList.transactions)
    expect(txFromPubKeyStub.callCount).to.equal(0)
    expect(txFromAddressesStub.callCount).to.equal(1)
    expect(txFromAddressesStub.calledOnceWith(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'], 1)).to.be.true
  })

  it('should fetch transactions of ETH (public key)', async () => {
    const wallet = getWalletWithPublicKey()
    stubCoinlibOfWallet(wallet)

    const transactions = await (await wallet.fetchTransactions(0)).transactions

    const stub = wallet.protocol.getTransactionsFromPublicKey as any

    expect(transactions).to.deep.equal(txList.transactions)
    expect(stub.callCount).to.equal(1)
    expect(stub.calledOnceWith('02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932', 0)).to.be.true
  })

  it('should fetch transactions of BTC (extended public key)', async () => {
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    stubCoinlibOfWallet(wallet)

    const transactions = await (await wallet.fetchTransactions(0)).transactions
    expect(transactions).to.deep.equal(txList.transactions)
  })

  // it('should not create wallet with unknown identifier', async () => {
  //   try {
  //     // TODO: Pass an unknown protocol
  //     const wallet = new AirGapMarketWallet(
  //       ({ identifier: 'IOTA' } as any) as ICoinProtocol,
  //       '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
  //       false,
  //       protocol.standardDerivationPath
  //     )
  //     expect(wallet).to.undefined
  //   } catch (error) {
  //     expect(error.message).to.equal('serializer(PROTOCOL_NOT_SUPPORTED): ')
  //   }
  // })

  it('should return undefined if no address has been derived', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
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
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })

  it('should derive address from extended public key and save it in wallet', async () => {
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
  })

  it('should derive address from extended public key with offset and save it in wallet', async () => {
    const wallet = new AirGapCoinWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      xPubProtocol.standardDerivationPath.substring(0, xPubProtocol.standardDerivationPath.length - 1),
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
  })

  it('serialize to JSON without circular dependencies', async () => {
    const wallet = new AirGapCoinWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      protocol.standardDerivationPath,
      '',
      AirGapWalletStatus.ACTIVE,
      new AirGapPriceService()
    )

    const json = wallet.toJSON()
    expect({ ...json, priceService: undefined }).to.deep.include({
      protocolIdentifier: MainProtocolSymbols.ETH,
      networkIdentifier: new EthereumProtocolOptions().network.identifier,
      publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      isExtendedPublicKey: false,
      derivationPath: "m/44'/60'/0'/0/0",
      addressIndex: undefined,
      addresses: []
    })
  })
})
