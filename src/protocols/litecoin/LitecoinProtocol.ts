import * as bitcoinJS from 'bitcoinjs-lib'

import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'

export class LitecoinProtocol extends BitcoinProtocol {
  constructor() {
    super(bitcoinJS.networks.litecoin, 'https://insight.litecore.io')
  }
}
