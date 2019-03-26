import * as BIP39 from 'bip39'
import { ICoinProtocol, EncodedType, DeserializedSyncProtocol } from '../../lib'
import BigNumber from 'bignumber.js'
import { SERIALIZER_VERSION } from '../../lib/serializer/constants'

const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol)
  noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol)
}

abstract class TestProtocolSpec {
  name: string
  lib: ICoinProtocol
  stub: ProtocolHTTPStub
  validAddresses: string[]
  wallet: {
    privateKey: string
    publicKey: string
    addresses: string[]
  }
  txs: {
    to: string[]
    from: string[]
    amount: BigNumber
    fee: BigNumber
    properties?: string[]
    unsignedTx: any
    signedTx: string
  }[]

  seed() {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  unsignedTransaction(tx: any): DeserializedSyncProtocol {
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

  signedTransaction(tx: any): DeserializedSyncProtocol {
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

  syncWallet(): DeserializedSyncProtocol {
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
