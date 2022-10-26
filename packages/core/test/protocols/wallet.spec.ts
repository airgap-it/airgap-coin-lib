import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')
import axios from '../../src/dependencies/src/axios-0.19.0/index'
import { AirGapWallet } from '../../src/index'
import { AirGapWalletStatus } from '../../src/wallet/AirGapWallet'
import { MockProtocol } from './mock/MockProtocol'
import { MockProtocolOptions } from './mock/MockProtocolOptions'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocol = new MockProtocol(new MockProtocolOptions(undefined, { standardDerivationPath: `m/44'/60'/0'` }))
const xPubProtocol = new MockProtocol(new MockProtocolOptions(undefined, { supportsHD: true, standardDerivationPath: `m/44'/0'/0'` }))

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

  // it('should not create wallet with unknown identifier', async () => {
  //   try {
  //     // TODO: Pass an unknown protocol
  //     const wallet = new AirGapWallet(
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
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      await protocol.getStandardDerivationPath(),
      '',
      AirGapWalletStatus.ACTIVE
    )

    const address = wallet.receivingPublicAddress
    expect(address).to.be.undefined
  })

  it('should derive address from public key', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      await protocol.getStandardDerivationPath(),
      '',
      AirGapWalletStatus.ACTIVE
    )

    const [address] = await wallet.deriveAddresses(1)
    expect(address).to.equal('0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f')
  })

  it('should derive address from public key and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      await protocol.getStandardDerivationPath(),
      '',
      AirGapWalletStatus.ACTIVE
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0xdd6ab26c81da7428142275263e6b56955d6761e98683e3972578314585ca3d8f')
  })

  it('should derive address from extended public key and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      await xPubProtocol.getStandardDerivationPath(),
      '',
      AirGapWalletStatus.ACTIVE
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x6c9d0bc4aebc2482eaee234ad34c4cf216b890b6fdace224db13059596a7744a')
  })

  it('should derive address from extended public key with offset and save it in wallet', async () => {
    const wallet = new AirGapWallet(
      xPubProtocol,
      'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
      true,
      (await xPubProtocol.getStandardDerivationPath()).substring(0, (await xPubProtocol.getStandardDerivationPath()).length - 1),
      '',
      AirGapWalletStatus.ACTIVE
    )

    const [address] = await wallet.deriveAddresses(1)
    wallet.addresses = [address]
    const storedAddress = wallet.receivingPublicAddress
    expect(storedAddress).to.equal('0x6c9d0bc4aebc2482eaee234ad34c4cf216b890b6fdace224db13059596a7744a')
  })

  it('serialize to JSON without circular dependencies (HD)', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      true,
      await protocol.getStandardDerivationPath(),
      'f4e222fd',
      AirGapWalletStatus.ACTIVE
    )

    const json = await wallet.toJSON()
    expect(json).to.deep.equal({
      protocolIdentifier: protocol.identifier,
      networkIdentifier: protocol.options.network.identifier,
      publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      isExtendedPublicKey: true,
      derivationPath: "m/44'/60'/0'",
      addressIndex: undefined,
      addresses: [],
      masterFingerprint: 'f4e222fd',
      status: AirGapWalletStatus.ACTIVE
    })
  })

  it('serialize to JSON without circular dependencies (non HD)', async () => {
    const wallet = new AirGapWallet(
      protocol,
      '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      false,
      `${await protocol.getStandardDerivationPath()}/0/0`,
      'f4e222fd',
      AirGapWalletStatus.ACTIVE
    )

    const json = await wallet.toJSON()
    expect(json).to.deep.equal({
      protocolIdentifier: protocol.identifier,
      networkIdentifier: protocol.options.network.identifier,
      publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
      isExtendedPublicKey: false,
      derivationPath: "m/44'/60'/0'/0/0",
      addressIndex: undefined,
      addresses: [],
      masterFingerprint: 'f4e222fd',
      status: AirGapWalletStatus.ACTIVE
    })
  })

  // TODO: Test address index with Tezos KT Addresses
})
