import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { ICPProtocol } from '../../src/v1'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class ICPProtocolStub implements ProtocolHTTPStub<ICPProtocol, ICPProtocol> {
  public async registerStub(testProtocolSpec: TestProtocolSpec<ICPProtocol, ICPProtocol>) {
    sinon.restore()

    sinon
      .stub(axios, 'get')
      .withArgs(`${(await testProtocolSpec.onlineLib.getNetwork()).rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 10000000000000000000, nonce: -1 } }))
    sinon
      .stub(axios, 'post')
      .withArgs(`/v2/transactions`)
      .returns(Promise.resolve({ tx_hash: 'tx_hash' }))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<ICPProtocol, ICPProtocol>) {
    sinon.restore()

    sinon
      .stub(axios, 'get')
      .withArgs(`${(await testProtocolSpec.onlineLib.getNetwork()).rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 0, nonce: -1 } }))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec<ICPProtocol, ICPProtocol>, address: string): Promise<any> {
    sinon.restore()

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${(await testProtocolSpec.onlineLib.getNetwork()).blockExplorerApi}/accounts/${address}/transactions?limit=${
          transactions.first.blocks.length
        }`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${(await testProtocolSpec.onlineLib.getNetwork()).blockExplorerApi}/accounts/${address}/transactions?limit=${
          transactions.first.blocks.length
        }&offset=${0}`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${(await testProtocolSpec.onlineLib.getNetwork()).blockExplorerApi}/accounts/${address}/transactions?limit=${
          transactions.next.blocks.length
        }&offset=${transactions.first.blocks.length}`
      )
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
