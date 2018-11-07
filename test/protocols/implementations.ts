import * as BIP39 from 'bip39'
import { ICoinProtocol, EncodedType, DeserializedSyncProtocol } from '../../lib'
import BigNumber from 'bignumber.js'
import { SERIALIZER_VERSION } from '../../lib/serializer/constants'

const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const seed = BIP39.mnemonicToSeedHex(mnemonic)

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol)
}

abstract class TestProtocolSpec {
  name: string
  lib: ICoinProtocol
  stub: ProtocolHTTPStub
  wallet: {
    privateKey: string
    publicKey: string
    addresses: string[]
    tx: {
      amount: BigNumber
      fee: BigNumber
    }
  }
  txs: {
    properties?: string[]
    unsignedTx: any
    signedTx: string
  }[]

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
        publicKey: this.wallet.publicKey,
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

export { mnemonic, seed, TestProtocolSpec, ProtocolHTTPStub }
