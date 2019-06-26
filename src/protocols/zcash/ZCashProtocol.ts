import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
const zcashJS = require('bitcoinjs-lib-zcash')
import { networks } from '../../networks'

export class ZCashProtocol extends BitcoinProtocol {
  constructor() {
    super(networks.zcash, 'https://explorer.zcashfr.io', zcashJS)
  }
}
