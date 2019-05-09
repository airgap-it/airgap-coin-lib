import * as bitGoUTXO from 'bitgo-utxo-lib'

import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'

export class GroestlcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook-test.groestlcoin.org/')
  }
}
