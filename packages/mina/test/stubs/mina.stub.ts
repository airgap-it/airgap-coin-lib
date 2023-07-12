// tslint:disable: max-classes-per-file
import { MinaNode } from '../../src/v1/node/MinaNode'
import { AccountBalance } from '../../src/v1/types/node'
import { MinaPayment, MinaSignature } from '../../src/v1/types/transaction'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

class MinaNodeStub implements MinaNode {
  public mode: 'regular' | 'noBalance' = 'regular'

  public async getNonce(_publicKey: string): Promise<string> {
    return '10'
  }

  public async getBalance(_publicKey: string): Promise<AccountBalance> {
    return this.mode === 'noBalance' ? { total: '0', liquid: '0' } : { total: '10000000000', liquid: '10000000000' }
  }

  public async sendTransaction(_payment: MinaPayment, _signature: MinaSignature): Promise<string> {
    return ''
  }
}

export class MinaProtocolStub implements ProtocolHTTPStub {
  public readonly nodeStub: MinaNodeStub = new MinaNodeStub()

  public async registerStub(testProtocolSpec: TestProtocolSpec): Promise<void> {
    this.nodeStub.mode = 'regular'
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<void> {
    this.nodeStub.mode = 'noBalance'
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any> {}
}
