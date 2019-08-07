import axios from 'axios'
import * as sinon from 'sinon'

import { AeternityProtocol } from '../../../src'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class AeternityProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: AeternityProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocol.epochRPC}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 10000000000000000000, nonce: -1 } }))
    sinon
      .stub(axios, 'post')
      .withArgs(`/v2/transactions`)
      .returns(Promise.resolve({ tx_hash: 'tx_hash' }))
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: AeternityProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${protocol.epochRPC}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 0, nonce: -1 } }))
  }
}
