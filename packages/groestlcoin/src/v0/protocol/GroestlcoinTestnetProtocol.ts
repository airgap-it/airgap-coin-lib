import { BitcoinProtocol } from '@airgap/bitcoin/v0'
// @ts-ignore
import * as bitGoUTXO from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { NetworkType } from '@airgap/coinlib-core/utils/ProtocolNetwork'

import {
  CryptoidBlockExplorer,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolNetworkExtras,
  GroestlcoinProtocolOptions
} from './GroestlcoinProtocolOptions'

export class GroestlcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    // super({ network: bitGoUTXO.networks.groestlcoin, baseApiUrl: 'https://blockbook-test.groestlcoin.org/' })
    super(
      new GroestlcoinProtocolOptions(
        new GroestlcoinProtocolNetwork(
          'Testnet',
          NetworkType.TESTNET,
          '',
          new CryptoidBlockExplorer('https://chainz.cryptoid.info/grs-test'),
          new GroestlcoinProtocolNetworkExtras('https://blockbook-test.groestlcoin.org/', bitGoUTXO.networks.groestlcoin)
        ),
        new GroestlcoinProtocolConfig()
      )
    )
  }
}
