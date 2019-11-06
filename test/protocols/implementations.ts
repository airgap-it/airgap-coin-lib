import * as BIP39 from '../../src/dependencies/src/bip39-2.5.0/index'
import BigNumber from '../../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { ICoinProtocol } from '../../src'
import { IACMessageType } from '../../src/serializer/v2/interfaces'
import { IACMessageDefinition } from '../../src/serializer/v2/message'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol): void
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol): void
}

abstract class TestProtocolSpec {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public lib: ICoinProtocol = {} as ICoinProtocol // Class is abstract, will be overwritten
  public stub: ProtocolHTTPStub = {} as ProtocolHTTPStub // Class is abstract, will be overwritten
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public wallet: {
    privateKey: string
    publicKey: string
    addresses: string[]
  } = {
    privateKey: '',
    publicKey: '',
    addresses: ['']
  }
  public txs: {
    to: string[]
    from: string[]
    amount: BigNumber
    fee: BigNumber
    properties?: string[]
    unsignedTx: any
    signedTx: string
  }[] = []
  public messages = [{ message: 'test', signature: '' }]

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public unsignedTransaction(tx: any): IACMessageDefinition[] {
    return [
      {
        protocol: this.lib.identifier,
        type: IACMessageType.TransactionSignRequest,
        data: {
          publicKey: this.wallet.publicKey,
          callback: 'airgap-wallet://?d=',
          transaction: tx.unsignedTx
        }
      }
    ]
  }

  public signedTransaction(tx: any): IACMessageDefinition[] {
    return [
      {
        protocol: this.lib.identifier,
        type: IACMessageType.TransactionSignResponse,
        data: {
          accountIdentifier: this.wallet.publicKey,
          transaction: tx.signedTx
        }
      }
    ]
  }

  public syncWallet(): IACMessageDefinition[] {
    return [
      {
        protocol: this.lib.identifier,
        type: IACMessageType.AccountShareResponse,
        data: {
          publicKey: this.wallet.publicKey,
          isExtendedPublicKey: this.lib.supportsHD,
          derivationPath: this.lib.standardDerivationPath
        }
      }
    ]
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
