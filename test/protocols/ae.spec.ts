import 'mocha'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { AETestProtocolSpec } from './specs/ae'
import { AEProtocol, IAirGapTransaction } from '../../src'
import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'
import axios from 'axios'
import { RawAeternityTransaction } from '../../src/serializer/unsigned-transactions/aeternity-transactions.serializer'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const aeProtocolSpec = new AETestProtocolSpec()
const aeLib = aeProtocolSpec.lib as AEProtocol

describe(`ICoinProtocol Aeternity - Custom Tests`, () => {
  const sampleAccountResponse: Readonly<any> = Object.freeze({
    data: [
      {
        block_height: 443,
        block_hash: 'mh_EoB9uuMGwhncyRgXSqztAz4PqUX41rNLtEcrVPsVwXksf8u58',
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        signatures: ['sg_JTXgD5WaKbDeVeDQXt9w7MyHXdxFdTqqzUvKFwoYsQZENc2zivckavGhBpX2h2a5QajiewuvsEgc3o7FxEB57oHTEn153'],
        tx: {
          amount: aeProtocolSpec.txs[0].amount.toFixed(),
          fee: aeProtocolSpec.txs[0].fee.toFixed(),
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

  beforeEach(() => {
    sinon
      .stub(axios, 'get')
      .withArgs(`${aeLib.epochMiddleware}/middleware/transactions/account/${aeProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve(sampleAccountResponse))
  })

  afterEach(() => {
    sinon.restore()
  })

  it("will include the timestamp if it's availalbe", async () => {
    const responseWithTimestamp = JSON.parse(JSON.stringify(sampleAccountResponse))
    responseWithTimestamp.data[0].time = 1543450515994

    sinon.restore()
    sinon
      .stub(axios, 'get')
      .withArgs(`${aeLib.epochMiddleware}/middleware/transactions/account/${aeProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve(responseWithTimestamp))

    const transactions = await aeLib.getTransactionsFromAddresses(aeProtocolSpec.wallet.addresses, 0, 0)

    expect(transactions).to.deep.equal([
      {
        amount: new BigNumber(aeProtocolSpec.txs[0].amount),
        fee: new BigNumber(aeProtocolSpec.txs[0].fee),
        from: aeProtocolSpec.wallet.addresses,
        isInbound: true,
        protocolIdentifier: aeLib.identifier,
        to: aeProtocolSpec.wallet.addresses,
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        blockHeight: 443,
        timestamp: 1543450516,
        data: '"create account" 1'
      }
    ])
  })

  it('can give a list of transactions from endpoints', async () => {
    const transactions = await aeLib.getTransactionsFromAddresses(aeProtocolSpec.wallet.addresses, 0, 0)

    expect(transactions).to.deep.equal([
      {
        amount: new BigNumber(aeProtocolSpec.txs[0].amount),
        fee: new BigNumber(aeProtocolSpec.txs[0].fee),
        from: aeProtocolSpec.wallet.addresses,
        isInbound: true,
        protocolIdentifier: aeLib.identifier,
        to: aeProtocolSpec.wallet.addresses,
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        blockHeight: 443,
        data: '"create account" 1'
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
    const privateKey = aeLib.getPrivateKeyFromHexSecret(aeProtocolSpec.seed(), aeLib.standardDerivationPath)

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
    const privateKey = aeLib.getPrivateKeyFromHexSecret(aeProtocolSpec.seed(), aeLib.standardDerivationPath)

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
