import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { ethereumProtocol } from './specs/ethereum'
import { bitcoinProtocol } from './specs/bitcoin'
import { SyncProtocolUtils, DeserializedSyncProtocol, EncodedType } from '../../lib/serializer/serializer'

const protocols = [ethereumProtocol, bitcoinProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  const syncProtocol = new SyncProtocolUtils()
  const deserializedTxSigningRequest: DeserializedSyncProtocol = {
    version: 1,
    protocol: protocol.lib.identifier,
    type: EncodedType.UNSIGNED_TRANSACTION,
    payload: {
      publicKey: protocol.wallet.publicKey,
      callback: 'airgap-wallet://?d=',
      transaction: protocol.txs[0].unsignedTx
    }
  }

  const deserializedSyncWalletRequest: DeserializedSyncProtocol = {
    version: 1,
    protocol: protocol.lib.identifier,
    type: EncodedType.WALLET_SYNC,
    payload: {
      publicKey: protocol.wallet.publicKey,
      isExtendedPublicKey: protocol.lib.supportsHD,
      derivationPath: protocol.lib.standardDerivationPath
    }
  }

  const deserializedSignedTxRequest: DeserializedSyncProtocol = {
    version: 1,
    protocol: protocol.lib.identifier,
    type: EncodedType.WALLET_SYNC,
    payload: {
      publicKey: protocol.wallet.publicKey,
      transaction: protocol.txs[0].signedTx
    }
  }

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize an transaction to a airgap protocol string`, async () => {
      const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)
      const deserializedTx = await syncProtocol.deserialize(serializedTx)

      expect(deserializedTxSigningRequest).to.deep.include(deserializedTx)
    })

    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)
      const deserializedTx = await syncProtocol.deserialize(serializedTx)

      const airGapTx = protocol.lib.getTransactionDetails(deserializedTx.payload)

      expect(airGapTx.from).to.deep.equal(protocol.wallet.addresses)
      expect(airGapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
      expect(airGapTx.fee).to.deep.equal(protocol.wallet.tx.fee)
    })

    it(`should be able to serialize and deserialize a sync-wallet request`, async () => {
      const serializedWalletRequest = await syncProtocol.serialize(deserializedSyncWalletRequest)
      const deserializedWalletRequest = await syncProtocol.deserialize(serializedWalletRequest)

      expect(deserializedTxSigningRequest).to.deep.include(deserializedWalletRequest)
    })

    it(`should be able to serialize and deserialize a signed-tx request`, async () => {
      const serializedSignedTx = await syncProtocol.serialize(deserializedSignedTxRequest)
      const deserializedTx = await syncProtocol.deserialize(serializedSignedTx)

      expect(deserializedSignedTxRequest).to.deep.include(deserializedTx)
    })
  })
})
