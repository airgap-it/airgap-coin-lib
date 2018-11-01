import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { ethereumProtocol } from './specs/ethereum'
import { bitcoinProtocol } from './specs/bitcoin'
import { SyncProtocolUtils, DeserializedSyncProtocol, EncodedType } from '../../lib/serializer/serializer'
import BigNumber from 'bignumber.js'

const protocols = [ethereumProtocol, bitcoinProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  const txSerializer = new SyncProtocolUtils()
  const deserializedTxSigningRequest: DeserializedSyncProtocol = {
    version: 1,
    protocol: 'eth',
    type: EncodedType.UNSIGNED_TRANSACTION,
    payload: {
      publicKey: protocol.wallet.publicKey,
      callback: 'airgap-wallet://?d=',
      transaction: protocol.txs[0].unsignedTx
    }
  }

  describe(`Serialization Protocol for ${protocol.name}`, () => {
    it(`should be able to serialize an transaction to a airgap protocol string`, async () => {
      const serializedTx = await txSerializer.serialize(deserializedTxSigningRequest)
      const deserializedTx = await txSerializer.deserialize(serializedTx)

      expect(deserializedTxSigningRequest).to.deep.include(deserializedTx)
    })

    it(`should be able to properly extract amount/fee using getTransactionDetails in combination with the coin-lib`, async () => {
      const serializedTx = await txSerializer.serialize(deserializedTxSigningRequest)
      const deserializedTx = await txSerializer.deserialize(serializedTx)

      const airGapTx = protocol.lib.getTransactionDetails(deserializedTx.payload)

      expect(airGapTx.from[0]).to.deep.equal(protocol.wallet.address)
      expect(airGapTx.amount).to.deep.equal(new BigNumber('0x0de0b6b3a7640000'))
      expect(airGapTx.fee).to.deep.equal(new BigNumber('0x04a817c800').multipliedBy(new BigNumber('0x5208')))
    })
  })
})
