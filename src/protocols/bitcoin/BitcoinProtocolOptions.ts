import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = ''

const BLOCK_EXPLORER_URL: string = 'https://live.blockcypher.com/btc'
const INDEXER_API: string = 'https://insight.bitpay.com'

export class BitcoinProtocolNetworkExtras {
  constructor(public readonly indexerApi: string = INDEXER_API, public readonly network: any = bitcoinJS.networks.bitcoin) {}
}

export class BlockcypherBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/address/${address}/`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/tx/${transactionId}`
  }
}

export class BitcoinProtocolNetwork implements ProtocolNetwork<BitcoinProtocolNetworkExtras> {
  constructor(
    public readonly name: string = MAINNET_NAME,
    public readonly type: NetworkType = NetworkType.MAINNET,
    public readonly rpcUrl: string = NODE_URL,
    public readonly blockExplorer: ProtocolBlockExplorer = new BlockcypherBlockExplorer(),
    public readonly extras: BitcoinProtocolNetworkExtras = new BitcoinProtocolNetworkExtras()
  ) {}
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
