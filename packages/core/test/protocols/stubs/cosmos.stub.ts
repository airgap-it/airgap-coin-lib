import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { CosmosProtocol } from '../../../src'
import { CosmosNodeClient } from '../../../src/protocols/cosmos/CosmosNodeClient'

export class CosmosProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: CosmosProtocol) {
    sinon
      .stub(protocol.nodeClient, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
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
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: CosmosProtocol) {
    sinon
      .stub(protocol, 'getAvailableBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
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
}
