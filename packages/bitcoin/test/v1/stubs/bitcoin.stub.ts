import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as sinon from 'sinon'

import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class BitcoinProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec) {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const stub = sinon.stub(axios, 'get')
    stub.withArgs(`${protocolNetwork.indexerApi}/api/v2/utxo/${testProtocolSpec.wallet.extendedPublicKey.value}?confirmed=true`).returns(
      Promise.resolve({
        data: [
          {
            txid: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            vout: 0,
            value: '10',
            height: 1353085,
            confirmations: 132951,
            address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            path: "m/44'/0'/0'/0/0"
          },
          {
            txid: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            vout: 0,
            value: '32418989',
            height: 1296906,
            confirmations: 189130,
            address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            path: "m/44'/0'/0'/1/2"
          }
        ]
      })
    )
  }
  public async noBalanceStub() {
    //
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
