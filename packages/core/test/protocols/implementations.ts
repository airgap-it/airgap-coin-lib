import { ICoinProtocol } from '../../src'
import * as BIP39 from '../../src/dependencies/src/bip39-2.5.0/index'
import { AirGapTransactionStatus } from '../../src/interfaces/IAirGapTransaction'
import { IACMessageType } from '../../src/serializer/interfaces'
import { IACMessageDefinitionObject } from '../../src/serializer/message'
import { AirGapWalletStatus } from '../../src/wallet/AirGapWallet'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol): any
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol): any
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
    masterFingerprint: string
    status: AirGapWalletStatus
  } = {
    privateKey: '',
    publicKey: '',
    addresses: [''],
    masterFingerprint: '',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs: {
    to: string[]
    from: string[]
    amount: string
    fee: string
    properties?: string[]
    unsignedTx: any
    signedTx: string
  }[] = []
  public messages: { message: string; signature: string }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public transactionStatusTests: { hashes: string[]; expectedResults: AirGapTransactionStatus[] }[] = []

  public transactionResult: {
    transactions: {
      to: string[]
      from: string[]
      amount: string
      fee: string
      protocolIdentifier: string
      isInbound: boolean
      network: any
      blockHeight?: string | number
      hash: string
      timestamp?: number
    }[]
    cursor: any
  } = {
    transactions: [{ to: [''], from: [''], amount: '', fee: '', protocolIdentifier: '', isInbound: true, network: {}, hash: '' }],
    cursor: ''
  }
  public nextTransactionResult: {
    transactions: {
      to: string[]
      from: string[]
      amount: string
      fee: string
      protocolIdentifier: string
      isInbound: boolean
      network: any
      blockHeight?: string | number
      hash: string
      timestamp?: number
    }[]
    cursor: any
  } = {
    transactions: [{ to: [''], from: [''], amount: '', fee: '', protocolIdentifier: '', isInbound: true, network: {}, hash: '' }],
    cursor: ''
  }

  public verifySignature?: (publicKey: string, tx: any) => Promise<boolean>

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }

  public unsignedTransaction(tx: any): IACMessageDefinitionObject[] {
    return [
      {
        id: 'random__id',
        protocol: this.lib.identifier,
        type: IACMessageType.TransactionSignRequest,
        payload: {
          publicKey: this.wallet.publicKey,
          transaction: tx.unsignedTx,
          callbackURL: 'airgap-wallet://?d='
        }
      }
    ]
  }

  public signedTransaction(tx: any): IACMessageDefinitionObject[] {
    return [
      {
        id: 'random__id',
        protocol: this.lib.identifier,
        type: IACMessageType.TransactionSignResponse,
        payload: {
          accountIdentifier: this.wallet.publicKey,
          transaction: tx.signedTx
        }
      }
    ]
  }

  public syncWallet(): IACMessageDefinitionObject[] {
    return [
      {
        id: 'random__id',
        protocol: this.lib.identifier,
        type: IACMessageType.AccountShareResponse,
        payload: {
          publicKey: this.wallet.publicKey,
          isExtendedPublicKey: this.lib.supportsHD,
          derivationPath: this.lib.standardDerivationPath
          // masterFingerprint: this.wallet.masterFingerprint,
          // isActive: true,
          // groupId: '0123abcd',
          // groupLabel: 'My Secret'
        }
      }
    ]
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
