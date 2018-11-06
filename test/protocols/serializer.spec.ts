import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { SyncProtocolUtils } from '../../lib/serializer/serializer'
import { SignedTransaction, UnsignedTransaction } from '../../lib'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { BitcoinTestProtocolSpec } from './specs/bitcoin'

const protocols = [new EthereumTestProtocolSpec(), new BitcoinTestProtocolSpec()]

protocols.forEach((protocol: TestProtocolSpec) => {
  const syncProtocol = new SyncProtocolUtils()

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize an transaction to a airgap protocol string`, async () => {
      const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(protocol.txs[0]))
      const deserializedTx = await syncProtocol.deserialize(serializedTx)

      expect(protocol.unsignedTransaction(protocol.txs[0])).to.deep.include(deserializedTx)
    })

    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(protocol.txs[0]))
      const deserializedTx = await syncProtocol.deserialize(serializedTx)

      const airGapTx = protocol.lib.getTransactionDetails(deserializedTx.payload as UnsignedTransaction)

      expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
      expect(airGapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
      expect(airGapTx.fee).to.deep.equal(protocol.wallet.tx.fee)
    })

    it(`should be able to properly extract amount/fee using from signedTx in combination with the coin-lib`, async () => {
      // TODO: Fix this
      if (protocol.lib.identifier === 'btc') {
        console.warn('skipping btc')
        return
      }

      const serializedTx = await syncProtocol.serialize(protocol.signedTransaction(protocol.txs[0]))
      const deserializedTx = await syncProtocol.deserialize(serializedTx)

      const airGapTx = protocol.lib.getTransactionDetailsFromSigned(deserializedTx.payload as SignedTransaction)

      expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
      expect(airGapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
      expect(airGapTx.fee).to.deep.equal(protocol.wallet.tx.fee)
    })

    it(`should be able to serialize and deserialize a sync-wallet request`, async () => {
      const serializedWalletRequest = await syncProtocol.serialize(protocol.signedTransaction(protocol.txs[0]))
      const deserializedWalletRequest = await syncProtocol.deserialize(serializedWalletRequest)

      expect(protocol.signedTransaction(protocol.txs[0])).to.deep.include(deserializedWalletRequest)
    })

    it(`should be able to serialize and deserialize a signed-tx request`, async () => {
      const serializedSignedTx = await syncProtocol.serialize(protocol.signedTransaction(protocol.txs[0]))
      const deserializedTx = await syncProtocol.deserialize(serializedSignedTx)

      expect(protocol.signedTransaction(protocol.txs[0])).to.deep.include(deserializedTx)
    })
  })
})
