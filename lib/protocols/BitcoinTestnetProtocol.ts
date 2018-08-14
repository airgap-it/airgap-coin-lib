import { BitcoinProtocol } from './BitcoinProtocol'
import * as bitcoinJS from 'bitcoinjs-lib'

export class BitcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super(bitcoinJS.networks.testnet, 'https://test-insight.bitpay.com')
  }
}
