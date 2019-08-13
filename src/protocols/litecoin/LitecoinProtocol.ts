import * as bitcoinJS from 'bitgo-utxo-lib'

import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'

export class LitecoinProtocol extends BitcoinProtocol {
  constructor() {
    super(bitcoinJS.networks.litecoin, 'https://insight.litecore.io')
  }
}
