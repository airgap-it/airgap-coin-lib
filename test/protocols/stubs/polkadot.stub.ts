import { ProtocolHTTPStub, TestProtocolSpec } from "../implementations";
import * as sinon from 'sinon'
import { PolkadotProtocol } from "../../../src/protocols/polkadot/PolkadotProtocol";
import { PolkadotTransactionType } from "../../../src/protocols/polkadot/transaction/PolkadotTransaction";
import BigNumber from "../../../src/dependencies/src/bignumber.js-9.0.0/bignumber";

export class PolkadotProtocolStub implements ProtocolHTTPStub {

    public registerStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
        sinon
            .stub(protocol.nodeClient, 'getBalance')
            .withArgs(sinon.match.any)
            .returns(Promise.resolve(new BigNumber(1000000000000)))

        this.registerDefaultStub(testProtocolSpec, protocol)
    }    
    
    public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
        sinon
            .stub(protocol, 'getBalanceOfPublicKey')
            .withArgs(sinon.match.any)
            .returns(Promise.resolve(new BigNumber(0)))

        this.registerDefaultStub(testProtocolSpec, protocol)
    }

    private registerDefaultStub(testProtocolSpec: TestProtocolSpec, protocol: PolkadotProtocol): void {
        sinon
            .stub(protocol, 'standardDerivationPath')
            .value('m/')

        sinon
            .stub(protocol.nodeClient, 'getTransactionMetadata')
            .withArgs(PolkadotTransactionType.TRANSFER)
            .returns(Promise.resolve({ moduleIndex: 4, callIndex: 0 }))
            .withArgs(PolkadotTransactionType.BOND)
            .returns(Promise.resolve({ moduleIndex: 6, callIndex: 0 }))
            .withArgs(PolkadotTransactionType.UNBOND)
            .returns(Promise.resolve({ moduleIndex: 6, callIndex: 2 }))
            .withArgs(PolkadotTransactionType.NOMINATE)
            .returns(Promise.resolve({ moduleIndex: 6, callIndex: 5 }))
            .withArgs(PolkadotTransactionType.STOP_NOMINATING)
            .returns(Promise.resolve({ moduleIndex: 6, callIndex: 6 }))

        sinon
            .stub(protocol.nodeClient, 'getTransferFeeEstimate')
            .returns(Promise.resolve(new BigNumber(testProtocolSpec.txs[0].fee)))

        sinon
            .stub(protocol.nodeClient, 'getNonce')
            .withArgs(sinon.match.any)
            .returns(Promise.resolve(new BigNumber(1)))

        sinon
            .stub(protocol.nodeClient, 'getFirstBlockHash')
            .returns(Promise.resolve('0xd51522c9ef7ba4e0990f7a4527de79afcac992ab97abbbc36722f8a27189b170'))

        sinon
            .stub(protocol.nodeClient, 'getLastBlockHash')
            .returns(Promise.resolve('0x33a7a745849347ce3008c07268be63d8cefd3ef61de0c7318e88a577fb7d26a9'))

        sinon
            .stub(protocol.nodeClient, 'getCurrentHeight')
            .returns(Promise.resolve(new BigNumber(3192)))

        sinon
            .stub(protocol.nodeClient, 'getSpecVersion')
            .returns(Promise.resolve(4))
    }

}