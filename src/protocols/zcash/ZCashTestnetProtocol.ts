import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
const zcashJS = require('bitcoinjs-lib-zcash')
import { networks } from '../../networks'

export class ZCashTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super(networks.zcash, 'https://explorer.testnet.z.cash', zcashJS) // we probably need another network here, explorer is ok
  }
}
