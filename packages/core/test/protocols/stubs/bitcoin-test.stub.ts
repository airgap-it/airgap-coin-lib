import * as sinon from 'sinon'

import { BitcoinTestnetProtocol } from '../../../src'
import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class BitcoinTestnetProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: BitcoinTestnetProtocol) {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://bitcoin.prod.gke.papers.tech/api/v2/utxo/tpubDCTJWMKQHnBETTGxJknEjmkiUtPtgbFDANkL55MZPgvu6YPddhRQXQXiqHZdfHwcoVNwTaHmS6DuNjcaYPRqVFkDogJdWSMLpSWSC4pNa3r?confirmed=true`
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
              address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
              path: "m/44'/1'/0'/0/0"
            },
            {
              txid: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              vout: 0,
              value: '65000000',
              height: 1296906,
              confirmations: 189130,
              address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
              path: "m/44'/1'/0'/1/3"
            }
          ]
        })
      )
  }
  public noBalanceStub() {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://bitcoin.prod.gke.papers.tech/api/v2/utxo/tpubDCTJWMKQHnBETTGxJknEjmkiUtPtgbFDANkL55MZPgvu6YPddhRQXQXiqHZdfHwcoVNwTaHmS6DuNjcaYPRqVFkDogJdWSMLpSWSC4pNa3r`
      )
      .returns(
        Promise.resolve({
          data: []
        })
      )
  }
}
