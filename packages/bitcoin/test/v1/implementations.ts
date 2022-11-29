import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import {
  Amount,
  ExtendedPublicKey,
  ExtendedSecretKey,
  PublicKey,
  SecretKey,
  Signature,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/module-kit'

import { BitcoinProtocol, BitcoinSignedTransaction, BitcoinUnits, BitcoinUnsignedTransaction } from '../../src/v1'
import { XPubResponse } from '../../src/v1/types/indexer'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, xpub: string): Promise<any>
}

abstract class TestProtocolSpec<
  _SignedTransaction extends SignedTransaction = BitcoinSignedTransaction,
  _UnsignedTransaction extends UnsignedTransaction = BitcoinUnsignedTransaction
> {
  public name: string = 'TEST'
  public abstract lib: BitcoinProtocol<_SignedTransaction, _UnsignedTransaction>
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
    amount: Amount<BitcoinUnits>
    fee: Amount<BitcoinUnits>
    properties?: string[]
    unsignedTx: _UnsignedTransaction
    signedTx: _SignedTransaction
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
