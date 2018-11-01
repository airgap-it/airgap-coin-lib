import { ProtocolHTTPStub } from '../implementations'
import * as sinon from 'sinon'

export class BitcoinProtocolStub implements ProtocolHTTPStub {
  registerStub() {
    console.log()
  }
}
