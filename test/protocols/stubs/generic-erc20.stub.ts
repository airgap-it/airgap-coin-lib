import BigNumber from 'bignumber.js'
import * as sinon from 'sinon'

import { EthereumProtocol } from '../../../src/protocols/ethereum/EthereumProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class GenericERC20ProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocol.web3.eth, 'getTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(80))

    sinon
      .stub(protocol.web3.eth, 'getBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))

    sinon
      .stub(protocol, 'estimateGas')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve('31705'))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
