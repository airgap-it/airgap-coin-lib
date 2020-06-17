import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { EthereumProtocol } from '../../../src/protocols/ethereum/EthereumProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class EthereumRopstenProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol.options.config.nodeClient, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(80))
    sinon
      .stub(protocol.options.config.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
    sinon
      .stub(protocol.options.config.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber(31705)))
    sinon
      .stub(protocol.options.config.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x3159709f2')))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    sinon
      .stub(protocol.options.config.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber(31705)))
    sinon
      .stub(protocol.options.config.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x3159709f2')))
  }
}
