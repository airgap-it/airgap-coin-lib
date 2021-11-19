import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'
import { capitalize } from '../../utils/string'
import { TezosDomains } from './domains/TezosDomains'

import { TezosNetwork } from './TezosProtocol'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://tezos-node.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://tezblock.io'
const INDEXER_API: string = 'https://tezos-mainnet-conseil.prod.gke.papers.tech'
const INDEXER_APIKEY: string = 'airgap00391'

export function nodeUrl(network: TezosNetwork): string {
  return network === TezosNetwork.MAINNET ? NODE_URL : `https://tezos-${network}-node.prod.gke.papers.tech`
}

export function indexerApi(network: TezosNetwork): string {
  return `https://tezos-${network}-conseil.prod.gke.papers.tech`
}

export function indexerNetwork(network: TezosNetwork): TezosNetwork {
  if (network === TezosNetwork.GRANADANET) {
    return TezosNetwork.MAINNET
  } else {
    return network
  }
}

export function indexerApiKey(network: TezosNetwork): string {
  return INDEXER_APIKEY
}

export function blockExplorerUrl(network: TezosNetwork): string {
  if (network === TezosNetwork.MAINNET) {
    return BLOCK_EXPLORER_URL
  } else {
    return `https://${network}.tezblock.io`
  }
}

export function tezosProtocolNetwork(network: TezosNetwork): TezosProtocolNetwork {
  return new TezosProtocolNetwork(
    capitalize(network),
    network === TezosNetwork.MAINNET ? NetworkType.MAINNET : NetworkType.TESTNET,
    nodeUrl(network),
    new TezblockBlockExplorer(blockExplorerUrl(network)),
    new TezosProtocolNetworkExtras(network, indexerApi(network), indexerNetwork(network), indexerApiKey(network))
  )
}

export class TezosProtocolNetworkExtras {
  constructor(
    public readonly network: TezosNetwork = TezosNetwork.MAINNET,
    public readonly conseilUrl: string = INDEXER_API,
    public readonly conseilNetwork: TezosNetwork = TezosNetwork.MAINNET,
    public readonly conseilApiKey: string = INDEXER_APIKEY
  ) {}
}

export class TezblockBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/transaction/${transactionId}`
  }
}

export class TezosProtocolNetwork extends ProtocolNetwork<TezosProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new TezblockBlockExplorer(),
    extras: TezosProtocolNetworkExtras = new TezosProtocolNetworkExtras()
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
