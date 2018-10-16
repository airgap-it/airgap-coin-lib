import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { AETokenProtocol, GenericERC20 } from '../../../lib'
import * as sinon from 'sinon'

export class HOPTokenProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: AETokenProtocol) {
    sinon
      .stub(protocol.web3.eth, 'getTransactionCount')
      .withArgs(testProtocolSpec.wallet.address)
      .returns(Promise.resolve(50))
    sinon
      .stub(protocol.web3.eth, 'getBalance')
      .withArgs(protocol.getAddressFromPublicKey(testProtocolSpec.wallet.publicKey))
      .returns(Promise.resolve(100000000000000000000))
    sinon.stub(protocol.tokenContract.methods, 'balanceOf').returns({ call: () => Promise.resolve(100000000000000000000) })
    sinon.stub(protocol.tokenContract.methods, 'transfer').returns({
      estimateGas: (args: any, cb: Function) => {
        cb(null, 16505)
      },
      encodeABI: () => {
        return new GenericERC20(protocol.tokenContract.address).tokenContract.methods.transfer.encodeABI
      }
    })
  }
}
