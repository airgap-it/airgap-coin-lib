import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { ethereumProtocol } from './specs/ethereum'
import { SyncProtocolUtils, DeserializedSyncProtocol, EncodedType } from '../../lib/serializer/serializer'
import BigNumber from 'bignumber.js'

const protocols = [ethereumProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  describe(`AirGap Serialization Protocol`, () => {
    it('should be able to serialize an EthereumTx to a airgap protocol string', async () => {
      const txSerializer = new SyncProtocolUtils()
      const deserializedTxSigningRequest: DeserializedSyncProtocol = {
        version: 1,
        protocol: 'eth',
        type: EncodedType.UNSIGNED_TRANSACTION,
        payload: {
          publicKey: '03c2c5da503a199294e2354425f9571d060a3a5971b4c61fcdccaf035d0fb18e6d',
          callback: 'airgap-wallet://?d=',
          transaction: {
            nonce: '0x00',
            gasLimit: '0x04a817c800',
            gasPrice: '0x5208',
            to: protocol.wallet.address,
            value: '0x0de0b6b3a7640000',
            chainId: '0x',
            data: '0x'
          }
        }
      }
      const serializedTx = await txSerializer.serialize(deserializedTxSigningRequest)
      const deserializedTx = await txSerializer.deserialize(serializedTx)

      expect(deserializedTxSigningRequest).to.deep.include(deserializedTx)

      expect(deserializedTx.payload.from).to.deep.equal(protocol.wallet.address)
      expect(deserializedTx.payload.amount).to.deep.equal(new BigNumber('0x0de0b6b3a7640000'))
      expect(deserializedTx.payload.fee).to.deep.equal(new BigNumber('0x04a817c800').multipliedBy(new BigNumber('0x5208')))
    })
  })
})
