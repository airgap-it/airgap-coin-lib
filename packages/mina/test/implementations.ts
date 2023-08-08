import { derive, mnemonicToSeed } from '@airgap/crypto'
import { Amount, CryptoDerivative, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { MinaProtocol, MinaSignedTransaction, MinaUnsignedTransaction } from '../src/v1'
import { MinaUnits } from '../src/v1/types/protocol'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any>
}

abstract class TestProtocolSpec<_Units extends string = MinaUnits> {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: MinaProtocol
  public abstract stub: ProtocolHTTPStub
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    derivationPath: string
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<_Units>
    fee: Amount<_Units>
    memo?: string
    unsignedTx: MinaUnsignedTransaction
    signedTx: MinaSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract seed(): string
  public abstract mnemonic(): string

  public async derivative(derivationPath?: string): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.lib.getMetadata(), this.lib.getCryptoConfiguration()])

    return derive(
      cryptoConfiguration,
      await mnemonicToSeed(cryptoConfiguration, this.mnemonic()),
      derivationPath ?? metadata.account.standardDerivationPath
    )
  }

  public transactionList(address: string): any {
    return {}
  }
}

export { TestProtocolSpec, ProtocolHTTPStub }
