import * as sinon from 'sinon'

import { BitcoinProtocol } from '../../../src'
import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class BitcoinProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: BitcoinProtocol) {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://btc1.trezor.io/api/v2/utxo/xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV?confirmed=true`
      )
      .returns(
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
  public noBalanceStub() {
    //
  }
}
