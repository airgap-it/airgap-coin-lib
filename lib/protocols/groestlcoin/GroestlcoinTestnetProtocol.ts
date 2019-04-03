import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
import * as bitGoUTXO from 'bitgo-utxo-lib'

export class GroestlcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook-test.groestlcoin.org/')
  }
}
