import * as sinon from 'sinon'

import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EthereumProtocol } from '@airgap/ethereum'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class EthereumProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(protocolOptions.nodeClient, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(0))
    sinon
      .stub(protocolOptions.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
    sinon
      .stub(protocolOptions.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(protocolOptions.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    sinon
      .stub(protocolOptions.nodeClient, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(protocolOptions.nodeClient, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }
}
