import * as sinon from 'sinon'

import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EthereumProtocol } from '../../../src/protocols/ethereum/EthereumProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class EthereumProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(0))
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(protocol.options.network.extras.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }
}
