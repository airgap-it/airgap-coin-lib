import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class GroestlcoinProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec) {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const stub = sinon.stub(axios, 'get')
    stub.withArgs(`${protocolNetwork.indexerApi}/api/v2/utxo/${testProtocolSpec.wallet.extendedPublicKey.value}?confirmed=true`).returns(
      Promise.resolve({
        data: [
          {
            txid: '859590b5fa94b477d6acfec3410d381a0aa2fe4f8a8c04f8519c4451e282b04d',
            vout: 0,
            value: '50000000',
            height: 2530931,
            confirmations: 8,
            address: 'FiEEq7G31QAsFfWFtWbMosVzUGQgtpUJsZ',
            path: "m/44'/17'/0'/0/1"
          },
          {
            txid: '8ad19fb60971488667333c184786bb6b24ecfe7599290683720d2631722e6e90',
            vout: 0,
            value: '50000000',
            height: 2530928,
            confirmations: 11,
            address: 'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz',
            path: "m/44'/17'/0'/0/0"
          }
        ]
      })
    )
  }
  public async noBalanceStub(testProtocolSpec: TestProtocolSpec) {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const stub = sinon.stub(axios, 'get')
    stub.withArgs(`${[protocolNetwork.indexerApi]}/api/v2/utxo/${testProtocolSpec.wallet.extendedPublicKey.value}`).returns(
      Promise.resolve({
        data: []
      })
    )
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, xpub: string): Promise<any> {
    sinon.restore()

    const protocolNetwork = await testProtocolSpec.lib.getNetwork()
    const transactions = testProtocolSpec.transactionList(xpub)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${protocolNetwork.indexerApi}/api/v2/xpub/${xpub}?details=txs&tokens=used&pageSize=${transactions.first.itemsOnPage}&page=1`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${protocolNetwork.indexerApi}/api/v2/xpub/${xpub}?details=txs&tokens=used&pageSize=${transactions.next.itemsOnPage}&page=2`
      )
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
