import BigNumber from 'bignumber.js'
import * as BIP39 from 'bip39'

import { DeserializedSyncProtocol, EncodedType, ICoinProtocol } from '../../src'
import { SERIALIZER_VERSION } from '../../src/serializer/constants'

const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

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

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public unsignedTransaction(tx: any): DeserializedSyncProtocol {
    return {
      version: SERIALIZER_VERSION,
      protocol: this.lib.identifier,
      type: EncodedType.UNSIGNED_TRANSACTION,
      payload: {
        publicKey: this.wallet.publicKey,
        callback: 'airgap-wallet://?d=',
        transaction: tx.unsignedTx
      }
    }
  }

  public signedTransaction(tx: any): DeserializedSyncProtocol {
    return {
      version: SERIALIZER_VERSION,
      protocol: this.lib.identifier,
      type: EncodedType.SIGNED_TRANSACTION,
      payload: {
        accountIdentifier: this.wallet.publicKey,
        transaction: tx.signedTx
      }
    }
  }

  public syncWallet(): DeserializedSyncProtocol {
    return {
      version: SERIALIZER_VERSION,
      protocol: this.lib.identifier,
      type: EncodedType.WALLET_SYNC,
      payload: {
        publicKey: this.wallet.publicKey,
        isExtendedPublicKey: this.lib.supportsHD,
        derivationPath: this.lib.standardDerivationPath
      }
    }
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
