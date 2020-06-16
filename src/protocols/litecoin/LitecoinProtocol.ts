import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'

export class LitecoinProtocol extends BitcoinProtocol {
  constructor() {
    super({ network: bitcoinJS.networks.litecoin, baseApiUrl: 'https://insight.litecore.io' })
  }
}
