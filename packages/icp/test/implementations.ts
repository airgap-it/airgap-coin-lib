import { derive, mnemonicToSeed } from '@airgap/crypto'
import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { AirGapOfflineProtocol, AirGapOnlineProtocol, Amount, CryptoDerivative, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { ICPSignedTransaction, ICPUnits, ICPUnsignedTransaction } from '../src/v1'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub<OfflineProtocol extends AirGapOfflineProtocol, OnlineProtocol extends AirGapOnlineProtocol> {
  registerStub(testProtocolSpec: TestProtocolSpec<OfflineProtocol, OnlineProtocol>): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec<OfflineProtocol, OnlineProtocol>): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec<OfflineProtocol, OnlineProtocol>, address: string): Promise<any>
}

abstract class TestProtocolSpec<
  OfflineProtocol extends AirGapOfflineProtocol = AirGapOfflineProtocol,
  OnlineProtocol extends AirGapOnlineProtocol = AirGapOnlineProtocol
> {
  public name: string = 'TEST'
  public abstract offlineLib: OfflineProtocol
  public abstract onlineLib: OnlineProtocol
  public abstract stub: ProtocolHTTPStub<OfflineProtocol, OnlineProtocol>
  public abstract validAddresses: string[]
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<ICPUnits>
    fee: Amount<ICPUnits>
    properties?: string[]
    unsignedTx: ICPUnsignedTransaction
    signedTx: ICPSignedTransaction
  }[]

  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract transactionList(address: string): any

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }

  public async derivative(): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.offlineLib.getMetadata(), this.offlineLib.getCryptoConfiguration()])

    return derive(cryptoConfiguration, await mnemonicToSeed(cryptoConfiguration, this.mnemonic()), metadata.account.standardDerivationPath)
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
