// import * as sinon from 'sinon'

import { CkBTCOfflineProtocol, CkBTCOnlineProtocol } from '../../src/v1'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class CkBTCProtocolStub implements ProtocolHTTPStub<CkBTCOfflineProtocol, CkBTCOnlineProtocol> {
  public async registerStub(testProtocolSpec: TestProtocolSpec<CkBTCOfflineProtocol, CkBTCOnlineProtocol>) {}
  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<CkBTCOfflineProtocol, CkBTCOnlineProtocol>) {}

  public async transactionListStub(
    testProtocolSpec: TestProtocolSpec<CkBTCOfflineProtocol, CkBTCOnlineProtocol>,
    address: string
  ): Promise<any> {
    // TODO
  }
}
