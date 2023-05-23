import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { TezosProtocol } from '../../../src/v1'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class TezosProtocolStub implements ProtocolHTTPStub<TezosProtocol> {
  public async registerStub(testProtocolSpec: TestProtocolSpec<TezosProtocol>) {
    const getStub = sinon.stub(axios, 'get')
    const postStub = sinon.stub(axios, 'post')

    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head`)
      .returns(Promise.resolve({ data: { chain_id: 'NetXdQprcVkpaWU' } }))

    postStub.withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
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
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`)
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    return { getStub, postStub }
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<TezosProtocol>) {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const getStub = sinon.stub(axios, 'get')

    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 0 }))

    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head~2/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(`${protocolNetwork.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`)
      .returns(Promise.resolve({ data: { key: 'test-key' } }))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec<TezosProtocol>, address: string): Promise<any> {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()
    const transactions = testProtocolSpec.transactionList(address)

    const getStub = sinon.stub(axios, 'get')

    getStub
      .withArgs(
        `${protocolNetwork.indexerApi}/v1/operations/transactions?anyof.target.sender=${address}&sort.desc=level&limit=${transactions.first.length}`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${protocolNetwork.indexerApi}/v1/operations/transactions?anyof.target.sender=${address}&sort.desc=level&limit=${
          transactions.next.length + 1
        }&offset=${transactions.first.length}`
      )
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
