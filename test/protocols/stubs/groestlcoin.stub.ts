import * as sinon from 'sinon'

import { GroestlcoinProtocol } from '../../../src'
import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class GroestlcoinProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: GroestlcoinProtocol) {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org/api/v2/utxo/xpub6D4xGrPgUpGHMmapDu9dWAyoZxM5agTYw5KaxZGGLA4DFV4XeQWSB2Sacmpf4KA2QoEuU2JDtDscuEGeELXEaQE2qXnMHEoyiEBaYmiTTUs?confirmed=true`
      )
      .returns(
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
  public noBalanceStub() {
    const stub = sinon.stub(axios, 'get')
    stub
      .withArgs(
        `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://blockbook.groestlcoin.org/api/v2/utxo/xpub6D4xGrPgUpGHMmapDu9dWAyoZxM5agTYw5KaxZGGLA4DFV4XeQWSB2Sacmpf4KA2QoEuU2JDtDscuEGeELXEaQE2qXnMHEoyiEBaYmiTTUs`
      )
      .returns(
        Promise.resolve({
          data: []
        })
      )
  }
}
