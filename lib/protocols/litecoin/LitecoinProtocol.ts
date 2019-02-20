import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
import * as bitcoinJS from 'bitcoinjs-lib'

export class LitecoinProtocol extends BitcoinProtocol {
  constructor() {
    super(bitcoinJS.networks.litecoin, 'https://insight.litecore.io')
  }
}
