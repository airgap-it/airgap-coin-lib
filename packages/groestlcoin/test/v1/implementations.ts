import { XPubResponse } from '@airgap/bitcoin/v1/types/indexer'
import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { Amount, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { GroestlcoinProtocol, GroestlcoinSignedTransaction, GroestlcoinUnits, GroestlcoinUnsignedTransaction } from '../../src/v1'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, xpub: string): Promise<any>
}

abstract class TestProtocolSpec {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: GroestlcoinProtocol
  public abstract stub: ProtocolHTTPStub
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    extendedSecretKey: ExtendedSecretKey
    secretKey?: SecretKey
    extendedPublicKey: ExtendedPublicKey
    publicKey?: PublicKey
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<GroestlcoinUnits>
    fee: Amount<GroestlcoinUnits>
    properties?: string[]
    unsignedTx: GroestlcoinUnsignedTransaction
    signedTx: GroestlcoinSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract transactionList(xpub: string): { first: XPubResponse; next: XPubResponse }

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
