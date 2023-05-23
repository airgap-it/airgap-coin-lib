import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { TezosProtocol } from '../../../src/v0'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class TezosProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const getStub = sinon.stub(axios, 'get')
    const postStub = sinon.stub(axios, 'post')

    const protocolOptions = await protocol.getOptions()

    getStub
      .withArgs(`${protocolOptions.network.rpcUrl}/chains/main/blocks/head`)
      .returns(Promise.resolve({ data: { chain_id: 'NetXdQprcVkpaWU' } }))

    postStub.withArgs(`${protocolOptions.network.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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
                  consumed_milligas: '10300000',
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
        `${protocolOptions.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocolOptions.network.rpcUrl}/chains/main/blocks/head~2/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocolOptions.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`
      )
      .returns(Promise.resolve({ data: 100000000 }))
    getStub
      .withArgs(
        `${protocolOptions.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    return { getStub, postStub }
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    const getStub = sinon.stub(axios, 'get')

    getStub
      .withArgs(
        `${protocolOptions.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocolOptions.network.rpcUrl}/chains/main/blocks/head~2/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocolOptions.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))
  }
}
