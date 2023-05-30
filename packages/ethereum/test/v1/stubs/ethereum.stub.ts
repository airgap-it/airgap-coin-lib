import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Balance } from '@airgap/module-kit'
import * as sinon from 'sinon'

import { EthereumUnits } from '../../../src/v1'
import { AirGapNodeClient } from '../../../src/v1/clients/node/AirGapNodeClient'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class EthereumProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec) {
    sinon
      .stub(AirGapNodeClient.prototype, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(0))
    sinon
      .stub(AirGapNodeClient.prototype, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))
    sinon
      .stub(AirGapNodeClient.prototype, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(AirGapNodeClient.prototype, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec) {
    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '0', unit: 'blockchain' } } as Balance<EthereumUnits>))
    sinon
      .stub(AirGapNodeClient.prototype, 'estimateTransactionGas')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x5208')))
    sinon
      .stub(AirGapNodeClient.prototype, 'getGasPrice')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(new BigNumber('0x4a817c800')))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any> {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${protocolNetwork.blockExplorerApi}?module=account&action=txlist&address=${address}&page=1&offset=${transactions.first.result.length}&sort=desc`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${protocolNetwork.blockExplorerApi}?module=account&action=txlist&address=${address}&page=2&offset=${
          transactions.next.result.length + 1
        }&sort=desc`
      )
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
