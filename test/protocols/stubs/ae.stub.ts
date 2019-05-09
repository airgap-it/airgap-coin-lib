import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import { AEProtocol } from '../../../src'
import * as sinon from 'sinon'

export class AEProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocol.epochRPC}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 10000000000000000000, nonce: -1 } }))
    sinon
      .stub(axios, 'post')
      .withArgs(`/v2/transactions`)
      .returns(Promise.resolve({ tx_hash: 'tx_hash' }))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocol.epochRPC}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 0, nonce: -1 } }))
  }
}
