import { expect } from 'chai'
import 'mocha'

import { IAirGapTransaction } from '../../dist'
import { SignedTransaction, UnsignedTransaction } from '../../src'
import { DeserializedSyncProtocol, SyncProtocolUtils } from '../../src/serializer/serializer'
import { getProtocolByIdentifier } from '../../src/utils/protocolsByIdentifier'

import { TestProtocolSpec } from './implementations'
import { AETestProtocolSpec } from './specs/ae'
import { BitcoinTestProtocolSpec } from './specs/bitcoin-test'
import { ERC20HOPTokenTestProtocolSpec } from './specs/erc20-hop-token'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'
import { TezosTestProtocolSpec } from './specs/tezos'

const protocols = [
  new EthereumTestProtocolSpec(),
  new BitcoinTestProtocolSpec(),
  new AETestProtocolSpec(),
  new ERC20HOPTokenTestProtocolSpec(),
  new TezosTestProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec()
]

protocols.forEach((protocol: TestProtocolSpec) => {
  const syncProtocol = new SyncProtocolUtils()

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize an transaction to a airgap protocol string`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        expect(protocol.unsignedTransaction(tx)).to.deep.include(deserializedTx)
      }
    })

    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        const airGapTxs: IAirGapTransaction[] = await protocol.lib.getTransactionDetails(deserializedTx.payload as UnsignedTransaction)

        if (airGapTxs.length !== 1) {
          throw new Error('Unexpected number of transactions')
        }

        const airGapTx: IAirGapTransaction = airGapTxs[0]

        expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
        expect(airGapTx.amount).to.deep.equal(tx.amount)
        expect(airGapTx.fee).to.deep.equal(tx.fee)
      }
    })

    it(`should be able to properly extract amount/fee using from signedTx in combination with the coin-lib`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        const airGapTxs = await protocol.lib.getTransactionDetailsFromSigned(deserializedTx.payload as SignedTransaction)

        if (airGapTxs.length !== 1) {
          throw new Error('Unexpected number of transactions')
        }

        const airGapTx: IAirGapTransaction = airGapTxs[0]

        expect(airGapTx.from).to.deep.equal(tx.from)
        expect(airGapTx.amount).to.deep.equal(tx.amount)
        expect(airGapTx.fee).to.deep.equal(tx.fee)
      }
    })

    it(`should be able to serialize and deserialize a sync-wallet request`, async () => {
      for (const tx of protocol.txs) {
        const serializedWalletRequest = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedWalletRequest = await syncProtocol.deserialize(serializedWalletRequest)

        expect(protocol.signedTransaction(tx)).to.deep.include(deserializedWalletRequest)
      }
    })

    it(`should be able to serialize and deserialize a signed-tx request`, async () => {
      for (const tx of protocol.txs) {
        const serializedSignedTx = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedSignedTx)

        expect(protocol.signedTransaction(tx)).to.deep.include(deserializedTx)
      }
    })

    it(`should be able to properly construct the protocol from a unsigned tx`, async () => {
      for (const tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        const reConstructedProtocol = getProtocolByIdentifier(deserializedTx.protocol)

        expect(protocol.lib.identifier).to.equal(reConstructedProtocol.identifier)
      }
    })

    it(`should be able to serialize and deserialize a message sign request`, async () => {
      const originalJson = {
        version: 1,
        protocol: protocol.lib.identifier,
        type: 3,
        payload: {
          message: 'TestMessage'
        }
      }

      const serialized: string = await syncProtocol.serialize(originalJson)
      const deserialized: DeserializedSyncProtocol = await syncProtocol.deserialize(serialized)

      expect(originalJson).to.deep.equal(deserialized)
    })

    it(`should be able to serialize and deserialize a message sign response`, async () => {
      const originalJson = {
        version: 1,
        protocol: protocol.lib.identifier,
        type: 4,
        payload: {
          message: 'TestMessage',
          signature: 'asdfasdf'
        }
      }

      const serialized: string = await syncProtocol.serialize(originalJson)
      const deserialized: DeserializedSyncProtocol = await syncProtocol.deserialize(serialized)

      expect(originalJson).to.deep.equal(deserialized)
    })
  })
})
