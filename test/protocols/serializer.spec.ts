import 'mocha'

import { expect } from 'chai'
import { TestProtocolSpec } from './implementations'
import { ethereumProtocol } from './specs/ethereum'
import { EthereumUnsignedTransactionSerializer } from '../../lib/serializer/transactions/ethereum-transactions.serializer'

const protocols = [ethereumProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  describe(`AirGap Serialization Protocol`, () => {
    it('should be able to serialize an EthereumTx to a airgap protocol string', () => {
      const txSerializer = new EthereumUnsignedTransactionSerializer()
      const serializedTx = txSerializer.serialize(protocol.wallet.publicKey, {
        nonce: '0x00',
        gasLimit: '0x3b9aca00',
        gasPrice: '0x5208',
        to: protocol.wallet.address,
        value: '0x8ac7230489e80000',
        chainId: '0x',
        data: '0x'
      })
      console.log(serializedTx)
    })
  })
})
