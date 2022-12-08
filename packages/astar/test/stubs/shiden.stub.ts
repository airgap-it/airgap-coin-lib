import * as sinon from 'sinon'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SubstrateTransactionType } from '@airgap/substrate/v0/protocol/common/data/transaction/SubstrateTransaction'

import { ShidenProtocol } from '../../src'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class ShidenProtocolStub implements ProtocolHTTPStub {
  public async registerStub(testProtocolSpec: TestProtocolSpec, protocol: ShidenProtocol): Promise<void> {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(protocolOptions.accountController, 'getBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(10000000000000)))

    sinon
      .stub(protocolOptions.accountController, 'getTransferableBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(10000000000000)))

    this.registerDefaultStub(testProtocolSpec, protocol)
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: ShidenProtocol): Promise<void> {
    const protocolOptions = await protocol.getOptions()

    sinon
      .stub(protocolOptions.accountController, 'getTransferableBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    this.registerDefaultStub(testProtocolSpec, protocol)
  }

  private async registerDefaultStub(testProtocolSpec: TestProtocolSpec, protocol: ShidenProtocol): Promise<void> {
    const protocolOptions = await protocol.getOptions()

    sinon.stub(protocol, 'standardDerivationPath').value('m/')

    sinon
      .stub(protocolOptions.nodeClient, 'getTransactionMetadata')
      .withArgs(SubstrateTransactionType.TRANSFER)
      .returns(Promise.resolve({ palletIndex: 31, callIndex: 0 }))

    sinon.stub(protocolOptions.nodeClient, 'getTransferFeeEstimate').returns(Promise.resolve(new BigNumber(testProtocolSpec.txs[0].fee)))

    sinon
      .stub(protocolOptions.nodeClient, 'getAccountInfo')
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
      .stub(protocolOptions.nodeClient, 'getFirstBlockHash')
      .returns(Promise.resolve('0xd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170'))

    sinon
      .stub(protocolOptions.nodeClient, 'getLastBlockHash')
      .returns(Promise.resolve('0x33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'))

    sinon.stub(protocolOptions.nodeClient, 'getCurrentHeight').returns(Promise.resolve(new BigNumber(3192)))

    sinon.stub(protocolOptions.nodeClient, 'getRuntimeVersion').returns(Promise.resolve({ specVersion: 30, transactionVersion: 1 }))
  }
}
