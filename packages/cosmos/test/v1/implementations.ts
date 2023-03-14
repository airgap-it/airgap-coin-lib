import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { CosmosPagedSendTxsResponse, CosmosSignedTransaction, CosmosUnsignedTransaction } from '@airgap/cosmos-core'
import { derive, mnemonicToSeed } from '@airgap/crypto'
import { Amount, CryptoDerivative, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { CosmosDenom, CosmosProtocol } from '../../src/v1'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec, address: string): Promise<any>
}

abstract class TestProtocolSpec {
  public name: string = 'TEST'
  // tslint:disable:no-object-literal-type-assertion
  public abstract lib: CosmosProtocol
  public abstract stub: ProtocolHTTPStub
  // tslint:enable:no-object-literal-type-assertion
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    addresses: string[]
  }
  public abstract txs: {
    to: string[]
    from: string[]
    amount: Amount<CosmosDenom>
    fee: Amount<CosmosDenom>
    properties?: string[]
    unsignedTx: CosmosUnsignedTransaction
    signedTx: CosmosSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract transactionList(address: string): {
    first: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
    next: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
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
