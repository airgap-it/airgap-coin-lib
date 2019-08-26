import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'

import { EthereumProtocol } from '../../../src/protocols/ethereum/EthereumProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class EthereumProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol.configuration.nodeClient, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(0))
    sinon
      .stub(protocol.configuration.nodeClient, 'fetchBalanceOf')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
