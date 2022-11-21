import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { AETestProtocolSpec } from './specs/ae'
import { RawAeternityTransaction } from '../src'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const aeProtocolSpec = new AETestProtocolSpec()
const aeLib = aeProtocolSpec.lib

describe(`ICoinProtocol Aeternity - Custom Tests`, () => {
  const sampleAccountResponse: Readonly<any> = Object.freeze({
    data: [
      {
        block_height: 443,
        block_hash: 'mh_EoB9uuMGwhncyRgXSqztAz4PqUX41rNLtEcrVPsVwXksf8u58',
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        signatures: ['sg_JTXgD5WaKbDeVeDQXt9w7MyHXdxFdTqqzUvKFwoYsQZENc2zivckavGhBpX2h2a5QajiewuvsEgc3o7FxEB57oHTEn153'],
        tx: {
          amount: aeProtocolSpec.txs[0].amount,
          fee: aeProtocolSpec.txs[0].fee,
          nonce: 1,
          payload: '"create account" 1',
          recipient_id: aeProtocolSpec.wallet.addresses[0],
          sender_id: aeProtocolSpec.wallet.addresses[0],
          ttl: 444,
          type: 'SpendTx',
          version: 1
        }
      }
    ]
  })

  beforeEach(async () => {
    sinon
      .stub(axios, 'get')
      .withArgs(
        `${(await aeLib.getOptions()).network.rpcUrl}/middleware/transactions/account/${aeProtocolSpec.wallet.addresses[0]}?page=1&limit=1`
      )
      .returns(Promise.resolve(sampleAccountResponse))
  })

  afterEach(() => {
    sinon.restore()
  })

  it("will include the timestamp if it's available", async () => {
    const responseWithTimestamp = JSON.parse(JSON.stringify(sampleAccountResponse))
    responseWithTimestamp.data[0].micro_time = 1543450515994

    const limit = 1

    sinon.restore()
    sinon
      .stub(axios, 'get')
      .withArgs(
        `${(await aeLib.getOptions()).network.rpcUrl}/mdw/txs/backward?account=${aeProtocolSpec.wallet.addresses[0]}&limit=${limit}`
      )
      .returns(Promise.resolve({ data: responseWithTimestamp }))

    const transactions = await (await aeLib.getTransactionsFromAddresses(aeProtocolSpec.wallet.addresses, limit)).transactions

    expect(transactions.map((transaction) => ({ ...transaction, network: undefined }))).to.deep.eq([
      {
        amount: new BigNumber(aeProtocolSpec.txs[0].amount).toString(),
        fee: new BigNumber(aeProtocolSpec.txs[0].fee).toString(),
        from: aeProtocolSpec.wallet.addresses,
        isInbound: true,
        protocolIdentifier: await aeLib.getIdentifier(),
        network: undefined,
        to: aeProtocolSpec.wallet.addresses,
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        blockHeight: 443,
        timestamp: 1543450516,
        data: '"create account" 1'
      }
    ])

    expect(transactions.map((transaction) => ({ ...transaction.network, blockExplorer: undefined, extras: undefined }))).to.deep.eq([
      {
        blockExplorer: undefined,
        extras: undefined,
        name: 'Mainnet',
        rpcUrl: 'https://mainnet.aeternity.io',
        type: 'MAINNET'
      }
    ])
  })

  it('can give a list of transactions from endpoints', async () => {
    const responseWithTimestamp = JSON.parse(JSON.stringify(sampleAccountResponse))
    const limit = 1

    sinon.restore()
    sinon
      .stub(axios, 'get')
      .withArgs(
        `${(await aeLib.getOptions()).network.rpcUrl}/mdw/txs/backward?account=${aeProtocolSpec.wallet.addresses[0]}&limit=${limit}`
      )
      .returns(Promise.resolve({ data: responseWithTimestamp }))

    const transactions = await (await aeLib.getTransactionsFromAddresses(aeProtocolSpec.wallet.addresses, 1)).transactions

    expect(transactions.map((transaction) => ({ ...transaction, network: undefined }))).to.deep.eq([
      {
        amount: new BigNumber(aeProtocolSpec.txs[0].amount).toString(),
        fee: new BigNumber(aeProtocolSpec.txs[0].fee).toString(),
        from: aeProtocolSpec.wallet.addresses,
        isInbound: true,
        protocolIdentifier: await aeLib.getIdentifier(),
        network: undefined,
        to: aeProtocolSpec.wallet.addresses,
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        blockHeight: 443,
        data: '"create account" 1'
      }
    ])

    expect(transactions.map((transaction) => ({ ...transaction.network, blockExplorer: undefined, extras: undefined }))).to.deep.eq([
      {
        blockExplorer: undefined,
        extras: undefined,
        name: 'Mainnet',
        rpcUrl: 'https://mainnet.aeternity.io',
        type: 'MAINNET'
      }
    ])
  })

  it('can convert a b64 encoded TX back to b58', async () => {
    const b58tx = aeLib.convertTxToBase58({
      transaction:
        '+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    })

    expect(b58tx).to.deep.equal({
      transaction:
        '7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RAocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    })
  })

  it('can sign both, b58 and b64 of a supplied TX', async () => {
    const privateKey = await aeLib.getPrivateKeyFromMnemonic(aeProtocolSpec.mnemonic(), await aeLib.getStandardDerivationPath())

    const rawAeTxBase58: RawAeternityTransaction = {
      transaction:
        'tx_7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RAocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    }

    const rawAeTxBase64: RawAeternityTransaction = {
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }

    const signedAeTxBase58 = await aeLib.signWithPrivateKey(privateKey, rawAeTxBase58)
    const signedAeTxBase64 = await aeLib.signWithPrivateKey(privateKey, rawAeTxBase64)

    expect(signedAeTxBase58).to.equal(aeProtocolSpec.txs[0].signedTx)
    expect(signedAeTxBase64).to.equal(aeProtocolSpec.txs[0].signedTx)

    expect(signedAeTxBase58).to.equal(signedAeTxBase64)
  })

  it('can sign neither invalid TXs', async () => {
    const privateKey = await aeLib.getPrivateKeyFromMnemonic(aeProtocolSpec.mnemonic(), await aeLib.getStandardDerivationPath())

    const rawAeTxBase58: RawAeternityTransaction = {
      transaction:
        'tx_7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RdocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    }

    const rawAeTxBase64: RawAeternityTransaction = {
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9fUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }

    try {
      await aeLib.signWithPrivateKey(privateKey, rawAeTxBase58)
    } catch (error) {
      expect(error.toString()).to.contain('invalid TX-encoding')
    }

    try {
      await aeLib.signWithPrivateKey(privateKey, rawAeTxBase64)
    } catch (error) {
      expect(error.toString()).to.contain('invalid TX-encoding')
    }
  })
})
