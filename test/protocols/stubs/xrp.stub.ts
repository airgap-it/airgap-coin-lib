import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'
import { XrpProtocol, IRippleLedgerProvider } from '../../../lib/protocols/xrp/XrpProtocol'
import * as sinon from 'sinon'
import BigNumber from 'bignumber.js'
import { RippleAPI, FormattedTransactionType, RippleAPIBroadcast } from 'ripple-lib'
import { FormattedGetAccountInfoResponse } from 'ripple-lib/dist/npm/ledger/accountinfo'

export class XrpProtocolStub implements ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: XrpProtocol) {
    var rippleApi = this.rippleApiWithStubbedConnectLogic()

    this.supplyAccountInfo(rippleApi, '100000000')

    this.stubToAlwaysProvideRippleApi(protocol, rippleApi)
  }
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: XrpProtocol) {
    var rippleApi = this.rippleApiWithStubbedConnectLogic()

    this.supplyAccountInfo(rippleApi, '0')

    this.stubToAlwaysProvideRippleApi(protocol, rippleApi)
  }

  supplyAccountInfo(rippleApi: RippleAPI, balance: string) {
    let accountInfo: FormattedGetAccountInfoResponse = {
      ownerCount: 1,
      previousAffectingTransactionID: '',
      previousAffectingTransactionLedgerVersion: 1,
      previousInitiatedTransactionID: '',
      sequence: 0,
      xrpBalance: balance
    }

    sinon
      .stub(rippleApi, 'getAccountInfo')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(accountInfo))
  }

  rippleApiWithStubbedConnectLogic(): RippleAPI {
    var rippleApi = new RippleAPI()

    sinon
      .stub(rippleApi, 'connect')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(undefined))

    sinon
      .stub(rippleApi, 'disconnect')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(undefined))

    return rippleApi
  }

  stubToAlwaysProvideRippleApi(xrpProtocol: XrpProtocol, rippleApi: RippleAPI) {
    sinon
      .stub(xrpProtocol.rippleLedgerProvider, 'getRippleApi')
      .withArgs(sinon.match.any)
      .returns(rippleApi)
  }
}
