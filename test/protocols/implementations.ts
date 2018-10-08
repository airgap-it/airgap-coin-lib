import * as BIP39 from 'bip39'
import { ICoinProtocol } from '../../lib'
import BigNumber from 'bignumber.js'

const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const seed = BIP39.mnemonicToSeedHex(mnemonic)

interface ProtocolHTTPStub {
  registerStub(testProtocolSpec: TestProtocolSpec, protocol: ICoinProtocol)
}

interface TestProtocolSpec {
  name: string
  lib: ICoinProtocol
  stub: ProtocolHTTPStub
  wallet: {
    privateKey: string
    publicKey: string
    address: string
    tx: {
      amount: BigNumber
      fee: BigNumber
    }
  }
  txs: {
    unsignedTx: any
    signedTx: string
  }[]
}

export { mnemonic, seed, TestProtocolSpec, ProtocolHTTPStub }
