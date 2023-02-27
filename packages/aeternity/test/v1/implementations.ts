import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { derive, mnemonicToSeed } from '@airgap/crypto'
import { Amount, CryptoDerivative, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { AeternityProtocol, AeternitySignedTransaction, AeternityUnits, AeternityUnsignedTransaction } from '../../src/v1'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any>
}

abstract class TestProtocolSpec {
  public name: string = 'TEST'
  public abstract lib: AeternityProtocol
  public abstract stub: ProtocolHTTPStub
  public abstract validAddresses: string[]
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<AeternityUnits>
    fee: Amount<AeternityUnits>
    properties?: string[]
    unsignedTx: AeternityUnsignedTransaction
    signedTx: AeternitySignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract transactionList(
    address: string
  ): {
    first: { data: any[]; next: string; prev: null }
    next: { data: any[]; next: null; prev: string }
  }

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }

  public async derivative(): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.lib.getMetadata(), this.lib.getCryptoConfiguration()])

    return derive(cryptoConfiguration, await mnemonicToSeed(cryptoConfiguration, this.mnemonic()), metadata.account.standardDerivationPath)
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
