import { Balance } from '@airgap/module-kit'
import { CosmosNodeClient } from '@airgap/cosmos-core'
import * as sinon from 'sinon'

import { CosmosDenom } from '../../../src/v1'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class CosmosProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec) {
    sinon
      .stub(CosmosNodeClient.prototype, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(
        Promise.resolve({
          total: { value: '100000000000000000000', unit: 'blockchain' },
          available: { value: '100000000000000000000', unit: 'blockchain' }
        })
      )

    sinon.stub(CosmosNodeClient.prototype, 'fetchNodeInfo').returns({
      protocol_version: { p2p: '7', block: '10', app: '0' },
      id: '207b44c701b3f89e0ef4a174a8d801562b8aa9ee',
      listen_addr: 'tcp://0.0.0.0:26656',
      network: 'cosmoshub-3',
      version: '0.32.7',
      channels: '4020212223303800',
      moniker: 'airgap-cosmos-mainnet',
      other: { tx_index: 'on', rpc_address: 'tcp://0.0.0.0:26657' }
    })

    sinon.stub(CosmosNodeClient.prototype, 'fetchAccount').returns({
      type: 'cosmos-sdk/Account',
      value: { address: '', coins: [], public_key: null, account_number: '0', sequence: '0' }
    })
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec) {
    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfAddress')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '0', unit: 'blockchain' } } as Balance<CosmosDenom>))

    sinon.stub(CosmosNodeClient.prototype, 'fetchNodeInfo').returns({
      protocol_version: { p2p: '7', block: '10', app: '0' },
      id: '207b44c701b3f89e0ef4a174a8d801562b8aa9ee',
      listen_addr: 'tcp://0.0.0.0:26656',
      network: 'cosmoshub-3',
      version: '0.32.7',
      channels: '4020212223303800',
      moniker: 'airgap-cosmos-mainnet',
      other: { tx_index: 'on', rpc_address: 'tcp://0.0.0.0:26657' }
    })

    sinon.stub(CosmosNodeClient.prototype, 'fetchAccount').returns({
      type: 'cosmos-sdk/Account',
      value: { address: '', coins: [], public_key: null, account_number: '0', sequence: '0' }
    })
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any> {
    sinon.restore()

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(CosmosNodeClient.prototype, 'fetchSendTransactionsFor')
      .withArgs(address, 1, 0, true)
      .returns(Promise.resolve(transactions.first.sender))
      .withArgs(address, 1, 0, false)
      .returns(Promise.resolve(transactions.first.recipient))
      .withArgs(address, sinon.match.any, 0, true)
      .returns(Promise.resolve(transactions.first.sender))
      .withArgs(address, sinon.match.any, 0, false)
      .returns(Promise.resolve(transactions.first.recipient))
      .withArgs(address, sinon.match.any, 2, true)
      .returns(Promise.resolve(transactions.next.sender))
      .withArgs(address, sinon.match.any, 2, false)
      .returns(Promise.resolve(transactions.next.recipient))
  }
}
