import { ProtocolHTTPStub } from '../implementations'

export class BitcoinProtocolStub implements ProtocolHTTPStub {
  registerStub() {
    console.log()
  }
  noBalanceStub() {
    console.log()
  }
}
