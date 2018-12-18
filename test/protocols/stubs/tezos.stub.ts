import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import axios from 'axios'
import { AEProtocol } from '../../../lib'
import * as sinon from 'sinon'
import BigNumber from 'bignumber.js'

export class TezosProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    //
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: AEProtocol) {
    //
  }
}
