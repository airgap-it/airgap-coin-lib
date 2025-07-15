import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { derive, mnemonicToSeed } from '@airgap/crypto'
import { Amount, CryptoDerivative, PublicKey, SecretKey } from '@airgap/module-kit'

import { StellarProtocol, StellarSignedTransaction, StellarUnits, StellarUnsignedTransaction } from '../../src/v1'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  loadAccountStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any>
  balanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any>
}

abstract class TestProtocolSpec {
  public name: string = 'TEST'
  public abstract lib: StellarProtocol
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
    amount: Amount<StellarUnits>
    fee: Amount<StellarUnits>
    properties?: string[]
    unsignedTx: StellarUnsignedTransaction
    signedTx: StellarSignedTransaction
  }[]

  public abstract setOptions: {
    unsignedTx: StellarUnsignedTransaction
  }

  public abstract transactionList(address: string): {
    first: { data: any }
    next: { data: any }
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
