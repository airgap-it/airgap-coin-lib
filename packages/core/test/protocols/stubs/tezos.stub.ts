import * as sinon from 'sinon'

import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosProtocol } from '../../../src/protocols/tezos/TezosProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class TezosProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const getStub = sinon.stub(axios, 'get')
    const postStub = sinon.stub(axios, 'post')

    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head`)
      .returns(Promise.resolve({ data: { chain_id: 'NetXdQprcVkpaWU' } }))

    postStub.withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
      Promise.resolve({
        data: {
          contents: [
            {
              kind: 'transaction',
              metadata: {
                balance_updates: [],
                operation_result: {
                  status: 'applied',
                  balance_updates: [],
                  consumed_gas: '10300',
                  paid_storage_size_diff: '0'
                },
                internal_operation_results: []
              }
            }
          ],
          signature: ''
        }
      })
    )

    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`
      )
      .returns(Promise.resolve({ data: 100000000 }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    return { getStub, postStub }
  }

  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    const getStub = sinon.stub(axios, 'get')

    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))
  }
}
