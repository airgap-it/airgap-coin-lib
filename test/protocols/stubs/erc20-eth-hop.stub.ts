import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { GenericERC20, HOPTokenProtocol } from '../../../lib'
import * as sinon from 'sinon'
import BigNumber from 'bignumber.js'

export class HOPTokenProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: HOPTokenProtocol) {
    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(protocol))), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(100000000000000000000)))

    sinon
      .stub(protocol.web3.eth, 'getTransactionCount')
      .withArgs(sinon.args.any)
      .returns(Promise.resolve(50))

    sinon
      .stub(protocol.tokenContract.methods, 'balanceOf')
      .withArgs(sinon.args.any)
      .returns({ call: () => Promise.resolve(100000000000000000000) })

    sinon
      .stub(protocol.tokenContract.methods, 'transfer')
      .withArgs(sinon.args.any)
      .returns({
        estimateGas: (args: any, cb: Function) => {
          cb(null, 16505)
        },
        encodeABI: () => {
          return new GenericERC20(protocol.tokenContract.address).tokenContract.methods.transfer.encodeABI
        }
      })
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: HOPTokenProtocol) {
    sinon
      .stub(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(protocol))), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
