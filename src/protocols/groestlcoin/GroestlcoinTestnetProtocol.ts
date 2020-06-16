import * as bitGoUTXO from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'

export class GroestlcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super({ network: bitGoUTXO.networks.groestlcoin, baseApiUrl: 'https://blockbook-test.groestlcoin.org/' })
  }
}
