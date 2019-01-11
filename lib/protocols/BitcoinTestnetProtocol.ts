import { BitcoinProtocol } from './BitcoinProtocol'
import * as bitcoinJS from 'bitcoinjs-lib'

export class BitcoinTestnetProtocol extends BitcoinProtocol {
  standardDerivationPath = `m/44'/1'/0'`
  constructor() {
    super(bitcoinJS.networks.testnet, 'https://test-insight.bitpay.com')
  }
}
