import { derive, mnemonicToSeed } from '@airgap/crypto'
import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import {
  AirGapProtocol,
  Amount,
  CryptoDerivative,
  PublicKey,
  SecretKey,
  Signature,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/module-kit'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub<_Protocol extends AirGapProtocol> {
  registerStub(testProtocolSpec: TestProtocolSpec<_Protocol>): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec<_Protocol>): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec<_Protocol>, address: string): Promise<any>
}

abstract class TestProtocolSpec<
  _Protocol extends AirGapProtocol<{ Units: _Units; UnsignedTransaction: _UnsignedTransaction; SignedTransaction: _SignedTransaction }>,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction,
  _SignedTransaction extends SignedTransaction = SignedTransaction
> {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: _Protocol
  public abstract stub: ProtocolHTTPStub<_Protocol>
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    addresses: string[]
  }
  public txs: {
    to: string[]
    from: string[]
    amount: Amount<_Units>
    fee: Amount<_Units>
    unsignedTx: _UnsignedTransaction
    signedTx: _SignedTransaction
  }[] = []
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public transactionList(address: string): { first: any[]; next: any[] } {
    return { first: [], next: [] }
  }

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }

  public async derivative(derivationPath?: string): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.lib.getMetadata(), this.lib.getCryptoConfiguration()])

    return derive(
      cryptoConfiguration,
      await mnemonicToSeed(cryptoConfiguration, this.mnemonic()),
      derivationPath ?? metadata.account.standardDerivationPath
    )
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
