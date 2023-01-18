import * as sinon from 'sinon'

import { AeternityProtocol } from '../../../src/v0'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class AeternityProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec, protocol: AeternityProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${(await protocol.getOptions()).network.rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 10000000000000000000, nonce: -1 } }))
    sinon
      .stub(axios, 'post')
      .withArgs(`/v2/transactions`)
      .returns(Promise.resolve({ tx_hash: 'tx_hash' }))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: AeternityProtocol) {
    sinon
      .stub(axios, 'get')
      .withArgs(`${(await protocol.getOptions()).network.rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 0, nonce: -1 } }))
  }
}
