import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { EthereumProtocol } from '../../../lib'
import * as sinon from 'sinon'

export class EthereumProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol.web3.eth, 'getTransactionCount')
      .withArgs(testProtocolSpec.wallet.address)
      .returns(Promise.resolve(0))
    sinon
      .stub(protocol.web3.eth, 'getBalance')
      .withArgs(protocol.getAddressFromPublicKey(testProtocolSpec.wallet.publicKey))
      .returns(Promise.resolve('100000000000000000000'))
  }
}
