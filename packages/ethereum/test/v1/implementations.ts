import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
import { AirGapTransactionStatus, Amount, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { EthereumSignedTransaction, EthereumUnsignedTransaction } from '../../src/v1'
import { EthereumBaseProtocol } from '../../src/v1/protocol/EthereumBaseProtocol'
import { EthereumUnits } from '../../src/v1/types/protocol'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub<
  _Units extends string = EthereumUnits,
  _EthereumProtocol extends EthereumBaseProtocol<_Units> = EthereumBaseProtocol<_Units>
> {
  registerStub(testProtocolSpec: TestProtocolSpec<_Units, _EthereumProtocol>): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec<_Units, _EthereumProtocol>): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec<_Units, _EthereumProtocol>, address: string): Promise<any>
}

abstract class TestProtocolSpec<
  _Units extends string = EthereumUnits,
  _EthereumProtocol extends EthereumBaseProtocol<_Units> = EthereumBaseProtocol<_Units>
> {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: _EthereumProtocol
  public abstract stub: ProtocolHTTPStub<_Units>
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    extendedSecretKey?: ExtendedSecretKey
    publicKey: PublicKey
    extendedPublicKey?: ExtendedPublicKey
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<_Units>
    fee: Amount<EthereumUnits>
    properties?: string[]
    unsignedTx: EthereumUnsignedTransaction
    signedTx: EthereumSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public transactionStatusTests: Record<string, AirGapTransactionStatus>[] = []

  public verifySignature?: (publicKey: string, tx: any) => Promise<boolean>

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }

  public transactionList(
    address: string
  ): { first: { status: string; message: string; result: any[] }; next: { status: string; message: string; result: any[] } } {
    const first = {
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '15223746',
          timeStamp: '1658914561',
          hash: '0x2958ed4765f2cf5cb8e350094a637c5acdceac03c3205120c2606bad3820a9c0',
          nonce: '47',
          blockHash: '0xde0d60ae1fc80fa566d8354af0904a9d0f3e3f026da58a5b347ef2da6f0e8026',
          transactionIndex: '37',
          from: address,
          to: '0xb4272071ecadd69d933adcd19ca99fe80664fc08',
          value: '0',
          gas: '73378',
          gasPrice: '7138887297',
          isError: '0',
          txreceipt_status: '1',
          input:
            '0xa9059cbb0000000000000000000000002135acedeedf2015dc7a74b14fff9db9d92d87f6000000000000000000000000000000000000000000000000017fb16d83be0000',
          contractAddress: '',
          cumulativeGasUsed: '1250122',
          gasUsed: '73378',
          confirmations: '895534',
          methodId: '0xa9059cbb',
          functionName: 'transfer(address _to, uint256 _value)'
        },
        {
          blockNumber: '15223737',
          timeStamp: '1658914487',
          hash: '0x12b454069e2f7009e9b73695900f99efccc710267c1d522817f42f0d85445124',
          nonce: '26',
          blockHash: '0x45c5acbf6ba8863c34a987e03745ed5f098a3734a982dd268b15ea36947eae10',
          transactionIndex: '39',
          from: address,
          to: '0xd709a66264b4055ec23e2af8b13d06a6375bb24c',
          value: '500000000000000',
          gas: '21000',
          gasPrice: '10865958995',
          isError: '0',
          txreceipt_status: '1',
          input: '0x',
          contractAddress: '',
          cumulativeGasUsed: '1739596',
          gasUsed: '21000',
          confirmations: '895543',
          methodId: '0x',
          functionName: ''
        }
      ]
    }

    const next = {
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '14370772',
          timeStamp: '1647072363',
          hash: '0x8fa0ccd7877623b3356747976c78e0cc7f3045530d15baa8f1c74cdf00db2b77',
          nonce: '46',
          blockHash: '0xd27bb50be9950a6a693fee5265cb038f1575947bd223108f6da82df2bd4638e5',
          transactionIndex: '105',
          from: address,
          to: '0xb4272071ecadd69d933adcd19ca99fe80664fc08',
          value: '0',
          gas: '73378',
          gasPrice: '10589004879',
          isError: '0',
          txreceipt_status: '1',
          input:
            '0xa9059cbb000000000000000000000000131782ffe80f013479272fe3e562cc1ed61c63a9000000000000000000000000000000000000000000000000017fb16d83be0000',
          contractAddress: '',
          cumulativeGasUsed: '6317089',
          gasUsed: '73378',
          confirmations: '1748508',
          methodId: '0xa9059cbb',
          functionName: 'transfer(address _to, uint256 _value)'
        }
      ]
    }

    return { first, next }
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
