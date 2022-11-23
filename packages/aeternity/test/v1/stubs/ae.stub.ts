import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class AeternityProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec) {
    sinon.restore()

    sinon
      .stub(axios, 'get')
      .withArgs(`${(await testProtocolSpec.lib.getNetwork()).rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 10000000000000000000, nonce: -1 } }))
    sinon
      .stub(axios, 'post')
      .withArgs(`/v2/transactions`)
      .returns(Promise.resolve({ tx_hash: 'tx_hash' }))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec) {
    sinon.restore()

    sinon
      .stub(axios, 'get')
      .withArgs(`${(await testProtocolSpec.lib.getNetwork()).rpcUrl}/v2/accounts/${testProtocolSpec.wallet.addresses[0]}`)
      .returns(Promise.resolve({ data: { balance: 0, nonce: -1 } }))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any> {
    sinon.restore()

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${(await testProtocolSpec.lib.getNetwork()).rpcUrl}/mdw/txs/backward?account=${address}&limit=${transactions.first.data.length}`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(`${(await testProtocolSpec.lib.getNetwork()).rpcUrl}/mdw/${transactions.first.next.replace(/^\/+/, '')}`)
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
