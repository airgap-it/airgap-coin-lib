import * as sinon from 'sinon'
import 'mocha'

import { expect } from 'chai'
import { UnsignedEthereumTransaction, EthereumUnsignedTransactionSerializer } from '../../lib/serializer/airgap-protocol-serializer'
import { TestProtocolSpec } from './implementations'
import { ethereumProtocol } from './specs/ethereum'

const protocols = [ethereumProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  describe(`AirGap Serialization Protocol`, () => {
    it('should be able to serialize an EthereumTx to a airgap protocol string', () => {
      const ethereumTx: UnsignedEthereumTransaction = ['0x00', '0x3b9aca00', '0x5208', protocol.wallet.address, '0x8ac7230489e80000', '0x']
      const txSerializer = new EthereumUnsignedTransactionSerializer(ethereumProtocol.lib)
      expect(
        txSerializer.serialize(
          protocol.wallet.address,
          protocol.wallet.tx.fee,
          protocol.wallet.tx.amount,
          protocol.wallet.publicKey,
          ethereumTx
        )
      ).toEqual('')
    })
  })
})
