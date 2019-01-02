import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import * as sinon from 'sinon'
import { TezosProtocol } from '../../../lib/protocols/TezosProtocol'

export class TezosProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const stub = sinon.stub(axios, 'get')

    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 2 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMHBtAaUv59LipV1czwZ5iQkxEktPJDE7A9sYXPkPeRzbBasNY8' }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    //
  }
}
