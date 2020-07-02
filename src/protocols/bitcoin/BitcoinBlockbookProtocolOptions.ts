import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = ''

const BLOCK_EXPLORER_URL: string = 'https://live.blockcypher.com/btc'
const INDEXER_API: string = `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${'https://btc1.trezor.io'}`

export class BitcoinBlockbookProtocolNetworkExtras {
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

export class BitcoinBlockbookProtocolNetwork extends ProtocolNetwork<BitcoinBlockbookProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new BlockcypherBlockExplorer(),
    extras: BitcoinBlockbookProtocolNetworkExtras = new BitcoinBlockbookProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class BitcoinBlockbookProtocolConfig {
  constructor(public readonly bitcoinJSLib: any = bitcoinJS) {}
}

export class BitcoinBlockbookProtocolOptions implements ProtocolOptions<BitcoinBlockbookProtocolConfig> {
  constructor(
    public readonly network: BitcoinBlockbookProtocolNetwork = new BitcoinBlockbookProtocolNetwork(),
    public readonly config: BitcoinBlockbookProtocolConfig = new BitcoinBlockbookProtocolConfig()
  ) {}
}
