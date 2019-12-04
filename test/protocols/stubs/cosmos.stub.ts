import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { CosmosProtocol } from '../../../src'

export class CosmosProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: CosmosProtocol) {
    sinon
      .stub(protocol.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: CosmosProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
