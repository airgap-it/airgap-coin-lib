import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'

import { AirGapTransaction } from '@airgap/module-kit'
import { AeternityUnsignedTransaction } from '../../src/v1'
import { AeternityTestProtocolSpec } from './specs/ae'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const aeternityProtocolSpec = new AeternityTestProtocolSpec()
const aeternityLib = aeternityProtocolSpec.lib

describe(`AirGapProtocol Aeternity - Custom Tests`, () => {
  const sampleTransactionsResponse: Readonly<any> = Object.freeze({
    data: [
      {
        block_height: 443,
        block_hash: 'mh_EoB9uuMGwhncyRgXSqztAz4PqUX41rNLtEcrVPsVwXksf8u58',
        hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
        signatures: ['sg_JTXgD5WaKbDeVeDQXt9w7MyHXdxFdTqqzUvKFwoYsQZENc2zivckavGhBpX2h2a5QajiewuvsEgc3o7FxEB57oHTEn153'],
        tx: {
          amount: aeternityProtocolSpec.txs[0].amount.value,
          fee: aeternityProtocolSpec.txs[0].fee.value,
          nonce: 1,
          payload: '"create account" 1',
          recipient_id: aeternityProtocolSpec.wallet.addresses[0],
          sender_id: aeternityProtocolSpec.wallet.addresses[0],
          ttl: 444,
          type: 'SpendTx',
          version: 1
        }
      }
    ]
  })

  it("will include the timestamp if it's available", async () => {
    const protocolNetwork = await aeternityLib.getNetwork()

    const responseWithTimestamp = JSON.parse(JSON.stringify(sampleTransactionsResponse))
    responseWithTimestamp.data[0].micro_time = 1543450515994

    const limit = 1

    sinon.restore()
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocolNetwork.rpcUrl}/mdw/txs/backward?account=${aeternityProtocolSpec.wallet.addresses[0]}&limit=${limit}`)
      .returns(Promise.resolve({ data: responseWithTimestamp }))

    const transactions: AirGapTransaction[] = (
      await aeternityLib.getTransactionsForAddresses(aeternityProtocolSpec.wallet.addresses, limit)
    ).transactions

    expect(JSON.parse(JSON.stringify(transactions))).to.deep.eq([
      {
        from: aeternityProtocolSpec.wallet.addresses,
        to: aeternityProtocolSpec.wallet.addresses,
        isInbound: true,

        amount: aeternityProtocolSpec.txs[0].amount,
        fee: aeternityProtocolSpec.txs[0].fee,

        network: protocolNetwork,

        timestamp: 1543450516,
        status: {
          type: 'unknown',
          hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
          block: 443
        },

        details: [{ type: 'plain', value: 'Payload' }, '"create account" 1']
      }
    ])
  })

  it('can give a list of transactions from endpoints', async () => {
    const protocolNetwork = await aeternityLib.getNetwork()

    const transactionsResponse = JSON.parse(JSON.stringify(sampleTransactionsResponse))
    const limit = 1

    sinon.restore()
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocolNetwork.rpcUrl}/mdw/txs/backward?account=${aeternityProtocolSpec.wallet.addresses[0]}&limit=${limit}`)
      .returns(Promise.resolve({ data: transactionsResponse }))

    const transactions = (await aeternityLib.getTransactionsForAddresses(aeternityProtocolSpec.wallet.addresses, limit)).transactions

    expect(JSON.parse(JSON.stringify(transactions))).to.deep.eq([
      {
        from: aeternityProtocolSpec.wallet.addresses,
        to: aeternityProtocolSpec.wallet.addresses,
        isInbound: true,

        amount: aeternityProtocolSpec.txs[0].amount,
        fee: aeternityProtocolSpec.txs[0].fee,

        network: protocolNetwork,

        status: {
          type: 'unknown',
          hash: 'th_z8bNzdugQdpiRUVXUmQbxoy5dLLEFLG6StBY95jF1KdXrRxiq',
          block: 443
        },

        details: [{ type: 'plain', value: 'Payload' }, '"create account" 1']
      }
    ])
  })

  it('can convert a b64 encoded TX back to b58', async () => {
    const b58tx = await aeternityLib.convertTransactionToBase58({
      type: 'unsigned',
      transaction:
        '+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    })

    expect(b58tx).to.deep.equal({
      type: 'unsigned',
      transaction:
        '7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RAocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    })
  })

  it('can sign both, b58 and b64 of a supplied TX', async () => {
    const protocolMetadata = await aeternityLib.getMetadata()

    const { secretKey } = await aeternityLib.getKeyPairFromSecret(
      { type: 'mnemonic', value: aeternityProtocolSpec.mnemonic() },
      protocolMetadata.account?.standardDerivationPath
    )

    const unsignedTxBase58: AeternityUnsignedTransaction = {
      type: 'unsigned',
      transaction:
        'tx_7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RAocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    }

    const unsignedTxBase64: AeternityUnsignedTransaction = {
      type: 'unsigned',
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }

    const signedAeTxBase58 = await aeternityLib.signTransactionWithSecretKey(unsignedTxBase58, secretKey)
    const signedAeTxBase64 = await aeternityLib.signTransactionWithSecretKey(unsignedTxBase64, secretKey)

    expect(signedAeTxBase58).to.deep.equal(aeternityProtocolSpec.txs[0].signedTx)
    expect(signedAeTxBase64).to.deep.equal(aeternityProtocolSpec.txs[0].signedTx)

    expect(signedAeTxBase58).to.deep.equal(signedAeTxBase64)
  })

  it('can sign neither invalid TXs', async () => {
    const protocolMetadata = await aeternityLib.getMetadata()

    const { secretKey } = await aeternityLib.getKeyPairFromSecret(
      { type: 'mnemonic', value: aeternityProtocolSpec.mnemonic() },
      protocolMetadata.account?.standardDerivationPath
    )

    const unsignedTxBase58: AeternityUnsignedTransaction = {
      type: 'unsigned',
      transaction:
        'tx_7WcPFuQ1mXzeHhN6jzxNUzz82bRN64RdocAamXGYuhV4NgQCF8tve1nGx8wm8XFy2UhkKzJ93LGXFtVZtYhVwgJBYRDNqztPA77dpdFx6fCs1gLJxBevJytJyJLns6AMNpbHR',
      networkId: 'ae_mainnet'
    }

    const unsignedTxBase64: AeternityUnsignedTransaction = {
      type: 'unsigned',
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9fUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }

    try {
      await aeternityLib.signTransactionWithSecretKey(unsignedTxBase58, secretKey)
    } catch (error) {
      expect(error.toString()).to.contain('invalid TX-encoding')
    }

    try {
      await aeternityLib.signTransactionWithSecretKey(unsignedTxBase64, secretKey)
    } catch (error) {
      expect(error.toString()).to.contain('invalid TX-encoding')
    }
  })
})
