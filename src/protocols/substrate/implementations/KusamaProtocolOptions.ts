// tslint:disable:max-classes-per-file

import { ProtocolBlockExplorer } from '../../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../../utils/ProtocolNetwork'
import { SubstrateNetwork } from '../SubstrateNetwork'
import { PolkascanBlockExplorer, SubstrateProtocolConfig, SubstrateProtocolOptions } from '../SubstrateProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://polkadot-kusama-node.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://polkascan.io/kusama'
const BLOCK_EXPLORER_API: string = 'https://api-01.polkascan.io/kusama/api/v1'

export class KusamaProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API, public readonly network: SubstrateNetwork = SubstrateNetwork.KUSAMA) {}
}

export class KusamaPolkascanBlockExplorer extends PolkascanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class KusamaProtocolConfig extends SubstrateProtocolConfig {
  constructor() {
    super()
  }
}

export class KusamaProtocolNetwork extends ProtocolNetwork<KusamaProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new KusamaPolkascanBlockExplorer(),
    extras: KusamaProtocolNetworkExtras = new KusamaProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class KusamaProtocolOptions extends SubstrateProtocolOptions<KusamaProtocolConfig> {
  constructor(
    public readonly network: KusamaProtocolNetwork = new KusamaProtocolNetwork(),
    public readonly config: KusamaProtocolConfig = new KusamaProtocolConfig()
  ) {
    super(network, config)
  }
}
