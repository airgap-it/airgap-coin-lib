import { BitcoinProtocol } from '@airgap/bitcoin/v0'
import * as bitGoUTXO from '@airgap/coinlib-core/dependencies/src/groestlcoinjs-lib-6.1.5/src/index'
import { NetworkType } from '@airgap/coinlib-core/utils/ProtocolNetwork'

import {
  CryptoidBlockExplorer,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolNetworkExtras,
  GroestlcoinProtocolOptions
} from './GroestlcoinProtocolOptions'

/**
 * NOTE: this protocol now uses Groestlcoin's real testnet parameters (`tgrs`, pubKeyHash 0x6f,
 * tpub/tprv version bytes). Before the bitgo-utxo-lib migration it was constructed with the
 * *mainnet* table (`F...`/`grs1...` addresses, `xpub` keys) while talking to the testnet indexer,
 * so the addresses it produced were never valid on the network it queried. Any testnet wallet
 * derived from the old parameters re-derives to a different address set.
 */
export class GroestlcoinTestnetProtocol extends BitcoinProtocol {
  constructor() {
    super(
      new GroestlcoinProtocolOptions(
        new GroestlcoinProtocolNetwork(
          'Testnet',
          NetworkType.TESTNET,
          '',
          new CryptoidBlockExplorer('https://chainz.cryptoid.info/grs-test'),
          new GroestlcoinProtocolNetworkExtras('https://blockbook-test.groestlcoin.org/', bitGoUTXO.networks.testnet)
        ),
        new GroestlcoinProtocolConfig()
      )
    )
  }
}
