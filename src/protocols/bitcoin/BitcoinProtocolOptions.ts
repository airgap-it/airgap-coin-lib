import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

import { BlockcypherBlockExplorer } from './BitcoinBlockbookProtocolOptions'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = ''

const INDEXER_API: string = 'https://insight.bitpay.com'

export class BitcoinProtocolNetworkExtras {
  constructor(public readonly indexerApi: string = INDEXER_API, public readonly network: any = bitcoinJS.networks.bitcoin) {}
}

export class BitcoinProtocolNetwork extends ProtocolNetwork<BitcoinProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new BlockcypherBlockExplorer(),
    extras: BitcoinProtocolNetworkExtras = new BitcoinProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class BitcoinProtocolConfig {
  constructor(public readonly bitcoinJSLib: any = bitcoinJS) {}
}

export class BitcoinProtocolOptions implements ProtocolOptions<BitcoinProtocolConfig> {
  constructor(
    public readonly network: BitcoinProtocolNetwork = new BitcoinProtocolNetwork(),
    public readonly config: BitcoinProtocolConfig = new BitcoinProtocolConfig()
  ) {}
}
