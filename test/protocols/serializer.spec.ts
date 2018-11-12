import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { SyncProtocolUtils } from '../../lib/serializer/serializer'
import { SignedTransaction, UnsignedTransaction } from '../../lib'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { BitcoinTestProtocolSpec } from './specs/bitcoin'
import { AETestProtocolSpec } from './specs/ae'
import { ERC20HOPTokenTestProtocolSpec } from './specs/erc20-hop-token'

const protocols = [
  new EthereumTestProtocolSpec(),
  new BitcoinTestProtocolSpec(),
  new AETestProtocolSpec(),
  new ERC20HOPTokenTestProtocolSpec()
]

protocols.forEach((protocol: TestProtocolSpec) => {
  const syncProtocol = new SyncProtocolUtils()

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize an transaction to a airgap protocol string`, async () => {
      for (let tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        expect(protocol.unsignedTransaction(tx)).to.deep.include(deserializedTx)
      }
    })

    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      for (let tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.unsignedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        const airGapTx = protocol.lib.getTransactionDetails(deserializedTx.payload as UnsignedTransaction)

        expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
        expect(airGapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
        expect(airGapTx.fee).to.deep.equal(protocol.wallet.tx.fee)
      }
    })

    it(`should be able to properly extract amount/fee using from signedTx in combination with the coin-lib`, async () => {
      // TODO: Fix this
      if (protocol.lib.identifier === 'btc') {
        console.warn('skipping btc')
        return
      }

      for (let tx of protocol.txs) {
        const serializedTx = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedTx)

        const airGapTx = protocol.lib.getTransactionDetailsFromSigned(deserializedTx.payload as SignedTransaction)

        expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
        expect(airGapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
        expect(airGapTx.fee).to.deep.equal(protocol.wallet.tx.fee)
      }
    })

    it(`should be able to serialize and deserialize a sync-wallet request`, async () => {
      for (let tx of protocol.txs) {
        const serializedWalletRequest = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedWalletRequest = await syncProtocol.deserialize(serializedWalletRequest)

        expect(protocol.signedTransaction(tx)).to.deep.include(deserializedWalletRequest)
      }
    })

    it(`should be able to serialize and deserialize a signed-tx request`, async () => {
      for (let tx of protocol.txs) {
        const serializedSignedTx = await syncProtocol.serialize(protocol.signedTransaction(tx))
        const deserializedTx = await syncProtocol.deserialize(serializedSignedTx)

        expect(protocol.signedTransaction(tx)).to.deep.include(deserializedTx)
      }
    })
  })
})
