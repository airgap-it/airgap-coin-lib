import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { EthereumProtocol, GenericERC20 } from '../../../src/v0'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class GenericERC20ProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec, protocol: EthereumProtocol) {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocolOptions.nodeClient, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(80))

    sinon
      .stub(protocolOptions.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))

    sinon
      .stub(protocol, 'estimateGas')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber('31705')))
  }
  public async noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: GenericERC20) {
    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(protocol)), 'getBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    sinon
      .stub(protocol, 'estimateGas')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
