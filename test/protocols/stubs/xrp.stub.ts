import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { XrpProtocol } from '../../../lib/protocols/xrp/XrpProtocol'
import * as sinon from 'sinon'
import BigNumber from 'bignumber.js'

export class XrpProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: XrpProtocol) {
    //sinon
    //    .stub(protocol.web3.eth, 'getTransactionCount')
    //    .withArgs(testProtocolSpec.wallet.addresses[0])
    //    .returns(Promise.resolve(0))
    //sinon
    //    .stub(protocol.web3.eth, 'getBalance')
    //    .withArgs(testProtocolSpec.wallet.addresses[0])
    //    .returns(Promise.resolve('100000000000000000000'))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: XrpProtocol) {
    //sinon
    //    .stub(protocol, 'getBalanceOfPublicKey')
    //    .withArgs(sinon.match.any)
    //    .returns(Promise.resolve(new BigNumber(0)))
  }
}
