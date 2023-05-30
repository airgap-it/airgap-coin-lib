import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Balance } from '@airgap/module-kit'
import * as sinon from 'sinon'
import { ERC20Token } from '../../../src/v1'

import { AirGapNodeClient } from '../../../src/v1/clients/node/AirGapNodeClient'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class ERC20TokenProtocolStub implements ProtocolHTTPStub<string, ERC20Token> {
  public async registerStub(testProtocolSpec: TestProtocolSpec<string, ERC20Token>) {
    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '100000000000000000000', unit: 'blockchain' } } as Balance))

    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '100000000000000000000', unit: 'blockchain' } } as Balance))

    sinon
      .stub(AirGapNodeClient.prototype, 'fetchTransactionCount')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve(80))

    sinon
      .stub(AirGapNodeClient.prototype, 'fetchBalance')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(Promise.resolve('100000000000000000000'))

    sinon
      .stub(testProtocolSpec.lib, 'estimateGas')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber('31705')))
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<string, ERC20Token>) {
    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '0', unit: 'blockchain' } } as Balance))

    sinon
      .stub(testProtocolSpec.lib, 'getBalanceOfAddresses')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve({ total: { value: '0', unit: 'blockchain' } } as Balance))

    sinon
      .stub(testProtocolSpec.lib, 'estimateGas')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec<string, ERC20Token>, address: string): Promise<any> {
    const [protocolNetwork, contractAddress] = await Promise.all([
      testProtocolSpec.lib.getNetwork(),
      testProtocolSpec.lib.getContractAddress()
    ])

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'get')
      .withArgs(
        `${protocolNetwork.blockExplorerApi}?module=account&action=tokentx&address=${address}&contractAddress=${contractAddress}&page=1&offset=${transactions.first.result.length}&sort=desc`
      )
      .returns(Promise.resolve({ data: transactions.first }))
      .withArgs(
        `${protocolNetwork.blockExplorerApi}?module=account&action=tokentx&address=${address}&contractAddress=${contractAddress}&page=2&offset=${transactions.first.result.length}&sort=desc`
      )
      .returns(Promise.resolve({ data: transactions.next }))
  }
}
