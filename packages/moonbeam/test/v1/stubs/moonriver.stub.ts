// tslint:disable: no-object-literal-type-assertion
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SubstrateAccountBalance } from '@airgap/substrate/v1'
import * as sinon from 'sinon'

import { MoonriverUnits } from '../../../src/v1'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class MoonriverProtocolStub implements ProtocolHTTPStub<MoonriverUnits> {
  public async registerStub(testProtocolSpec: TestProtocolSpec<MoonriverUnits>): Promise<void> {
    sinon
      .stub(testProtocolSpec.lib.accountController, 'getBalance')
      .withArgs(sinon.match.any)
      .returns(
        Promise.resolve({
          total: new BigNumber(10000000000000),
          existentialDeposit: new BigNumber(0),
          transferable: new BigNumber(10000000000000),
          transferableCoveringFees: new BigNumber(10000000000000)
        } as SubstrateAccountBalance)
      )

    await this.registerDefaultStub(testProtocolSpec)
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<MoonriverUnits>): Promise<void> {
    sinon
      .stub(testProtocolSpec.lib.accountController, 'getBalance')
      .withArgs(sinon.match.any)
      .returns(
        Promise.resolve({
          total: new BigNumber(0),
          existentialDeposit: new BigNumber(0),
          transferable: new BigNumber(0),
          transferableCoveringFees: new BigNumber(0)
        } as SubstrateAccountBalance)
      )

    await this.registerDefaultStub(testProtocolSpec)
  }

  private async registerDefaultStub(testProtocolSpec: TestProtocolSpec<MoonriverUnits>): Promise<void> {
    sinon
      .stub(testProtocolSpec.lib.nodeClient, 'getTransactionMetadata')
      .withArgs('transfer')
      .returns(Promise.resolve({ palletIndex: 3, callIndex: 0 }))

    sinon
      .stub(testProtocolSpec.lib.nodeClient, 'getTransferFeeEstimate')
      .returns(Promise.resolve(new BigNumber(testProtocolSpec.txs[0].fee.value)))

    sinon
      .stub(testProtocolSpec.lib.nodeClient, 'getAccountInfo')
      .withArgs(sinon.match.any)
      .returns(
        Promise.resolve({
          nonce: { value: new BigNumber(1) },
          data: {
            free: { value: new BigNumber(1000000000000) },
            reserved: { value: new BigNumber(0) },
            miscFrozen: { value: new BigNumber(0) },
            feeFrozen: { value: new BigNumber(0) }
          }
        })
      )

    sinon
      .stub(testProtocolSpec.lib.nodeClient, 'getFirstBlockHash')
      .returns(Promise.resolve('0xd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170'))

    sinon
      .stub(testProtocolSpec.lib.nodeClient, 'getLastBlockHash')
      .returns(Promise.resolve('0x33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'))

    sinon.stub(testProtocolSpec.lib.nodeClient, 'getCurrentHeight').returns(Promise.resolve(new BigNumber(3192)))

    sinon.stub(testProtocolSpec.lib.nodeClient, 'getRuntimeVersion').returns(Promise.resolve({ specVersion: 30, transactionVersion: 1 }))
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec<MoonriverUnits>, address: string): Promise<any> {
    const protocolNetwork = await testProtocolSpec.lib.getNetwork()

    const transactions = testProtocolSpec.transactionList(address)

    sinon
      .stub(axios, 'post')
      .withArgs(`${protocolNetwork.blockExplorerApi}/transfers`, {
        row: transactions.first.transfers.data.transfers.length,
        page: 0,
        address
      })
      .returns(Promise.resolve({ data: transactions.first.transfers }))
      .withArgs(`${protocolNetwork.blockExplorerApi}/account/reward_slash`, {
        row: transactions.first.transfers.data.transfers.length,
        page: 0,
        address
      })
      .returns(Promise.resolve({ data: transactions.first.rewardSlash }))
      .withArgs(`${protocolNetwork.blockExplorerApi}/transfers`, {
        row: transactions.next.transfers.data.transfers.length + transactions.next.rewardSlash.data.list.length + 1,
        page: 1,
        address
      })
      .returns(Promise.resolve({ data: transactions.next.transfers }))
      .withArgs(`${protocolNetwork.blockExplorerApi}/account/reward_slash`, {
        row: transactions.next.transfers.data.transfers.length + transactions.next.rewardSlash.data.list.length + 1,
        page: 1,
        address
      })
      .returns(Promise.resolve({ data: transactions.next.rewardSlash }))
  }
}
