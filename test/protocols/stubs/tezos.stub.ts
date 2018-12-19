import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import { AEProtocol } from '../../../lib'
import * as sinon from 'sinon'

export class TezosProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    const stub = sinon.stub(axios, 'get')

    stub
      .withArgs(`${protocol.epochRPC}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 10000000 }))
    stub
      .withArgs(`${protocol.epochRPC}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMHBtAaUv59LipV1czwZ5iQkxEktPJDE7A9sYXPkPeRzbBasNY8' }))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    //
  }
}
