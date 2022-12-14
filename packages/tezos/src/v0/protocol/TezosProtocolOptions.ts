import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'

import { TezosDomains } from './domains/TezosDomains'
import { TezosIndexerClient } from './indexerClient/TezosIndexerClient'
import { TezosProtocolIndexerClient } from './indexerClient/TezosProtocolIndexerClient'
import { TezosNetwork } from './TezosProtocol'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://tezos-node.prod.gke.papers.tech'
const INDEXER_URL: string = 'https://tezos-mainnet-indexer.prod.gke.papers.tech'
const BLOCK_EXPLORER_URL: string = 'https://tzkt.io'

export type TezosProtocolNetworkResolver = (network: string) => TezosProtocolNetwork

export interface TezosProtocolNetworkExtras {
  network: TezosNetwork
  indexerClient: TezosProtocolIndexerClient
}

export class TezosBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/${transactionId}`
  }
}

export class TezosProtocolNetwork extends ProtocolNetwork<TezosProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new TezosBlockExplorer(),
    extras: TezosProtocolNetworkExtras = { network: TezosNetwork.MAINNET, indexerClient: new TezosIndexerClient(INDEXER_URL) }
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class TezosProtocolConfig {
  constructor(public readonly domains?: TezosDomains) {}
}

export class TezosProtocolOptions implements ProtocolOptions<TezosProtocolConfig> {
  // tslint:disable-next-line:no-unnecessary-initializer
  constructor(
    public readonly network: TezosProtocolNetwork = new TezosProtocolNetwork(),
    public readonly config: TezosProtocolConfig = new TezosProtocolConfig()
  ) {}
}
