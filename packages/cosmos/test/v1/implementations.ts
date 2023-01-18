import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { CosmosProtocol, CosmosSignedTransaction, CosmosUnits, CosmosUnsignedTransaction } from '../../src/v1'
import { CosmosPagedSendTxsResponse } from '../../src/v1/types/rpc'

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
    amount: Amount<CosmosUnits>
    fee: Amount<CosmosUnits>
    properties?: string[]
    unsignedTx: CosmosUnsignedTransaction
    signedTx: CosmosSignedTransaction
  }[]
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  public abstract transactionList(
    address: string
  ): {
    first: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
    next: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
  }

  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  public mnemonic(): string {
    return mnemonic
  }
}

export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
