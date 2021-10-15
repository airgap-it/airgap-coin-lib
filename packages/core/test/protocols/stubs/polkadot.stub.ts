import * as sinon from 'sinon'

import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SubstrateTransactionType } from '../../../src/protocols/substrate/common/data/transaction/SubstrateTransaction'
import { PolkadotProtocol } from '../../../src/protocols/substrate/polkadot/PolkadotProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class PolkadotProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
    sinon
      .stub(protocol.options.accountController, 'getBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(10000000000000)))

    sinon
      .stub(protocol.options.accountController, 'getTransferableBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(10000000000000)))

    this.registerDefaultStub(testProtocolSpec, protocol)
  }

  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
    sinon
      .stub(protocol.options.accountController, 'getTransferableBalance')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))

    this.registerDefaultStub(testProtocolSpec, protocol)
  }

  private registerDefaultStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
    sinon.stub(protocol, 'standardDerivationPath').value('m/')

    sinon
      .stub(protocol.options.nodeClient, 'getTransactionMetadata')
      .withArgs(SubstrateTransactionType.TRANSFER)
      .returns(Promise.resolve({ palletIndex: 4, callIndex: 0 }))
      .withArgs(SubstrateTransactionType.BOND)
      .returns(Promise.resolve({ palletIndex: 6, callIndex: 0 }))
      .withArgs(SubstrateTransactionType.UNBOND)
      .returns(Promise.resolve({ palletIndex: 6, callIndex: 2 }))
      .withArgs(SubstrateTransactionType.NOMINATE)
      .returns(Promise.resolve({ palletIndex: 6, callIndex: 5 }))
      .withArgs(SubstrateTransactionType.CANCEL_NOMINATION)
      .returns(Promise.resolve({ palletIndex: 6, callIndex: 6 }))

    sinon.stub(protocol.options.nodeClient, 'getTransferFeeEstimate').returns(Promise.resolve(new BigNumber(testProtocolSpec.txs[0].fee)))

    sinon
      .stub(protocol.options.nodeClient, 'getAccountInfo')
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
      .stub(protocol.options.nodeClient, 'getFirstBlockHash')
      .returns(Promise.resolve('0xd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170'))

    sinon
      .stub(protocol.options.nodeClient, 'getLastBlockHash')
      .returns(Promise.resolve('0x33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'))

    sinon.stub(protocol.options.nodeClient, 'getCurrentHeight').returns(Promise.resolve(new BigNumber(3192)))

    sinon.stub(protocol.options.nodeClient, 'getRuntimeVersion').returns(Promise.resolve({ specVersion: 30, transactionVersion: 1 }))
  }
}
