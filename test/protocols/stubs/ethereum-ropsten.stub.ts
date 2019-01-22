import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { EthereumProtocol } from '../../../lib/protocols/ethereum/EthereumProtocol'
import * as sinon from 'sinon'
import BigNumber from 'bignumber.js'

export class EthereumRopstenProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol.web3.eth, 'getTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(80))
    sinon
      .stub(protocol.web3.eth, 'getBalance')
      .withArgs(protocol.getAddressFromPublicKey(testProtocolSpec.wallet.publicKey))
      .returns(Promise.resolve('100000000000000000000'))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
