import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import * as sinon from 'sinon'
import { TezosProtocol } from '../../../lib/protocols/TezosProtocol'
import BigNumber from 'bignumber.js'

export class TezosProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const stub = sinon.stub(axios, 'get')

    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 917315 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`)
      .returns(Promise.resolve({ data: { key: 'test-key' } }))
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
