// tslint:disable: max-classes-per-file
import { ProtocolBlockExplorer } from '../../../../utils/ProtocolBlockExplorer'
import { NetworkType } from '../../../../utils/ProtocolNetwork'
import { SubscanBlockExplorer } from '../../SubstrateProtocolOptions'
import { AstarProtocolConfig, AstarProtocolNetwork, AstarProtocolNetworkExtras, BaseAstarProtocolOptions } from '../AstarProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://shiden-proxy.airgap.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://shiden.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://shiden.subscan.prod.gke.papers.tech/api/scan'

export class ShidenProtocolConfig extends AstarProtocolConfig {
  constructor() {
    super()
  }
}

export class ShidenSubscanBlockExplorer extends SubscanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class ShidenProtocolNetworkExtras extends AstarProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {
    super(apiUrl)
  }
}

export class ShidenProtocolNetwork extends AstarProtocolNetwork {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new ShidenSubscanBlockExplorer(),
    extras: ShidenProtocolNetworkExtras = new ShidenProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class ShidenProtocolOptions extends BaseAstarProtocolOptions<ShidenProtocolConfig> {
  constructor(
    public readonly network: ShidenProtocolNetwork = new ShidenProtocolNetwork(),
    public readonly config: ShidenProtocolConfig = new ShidenProtocolConfig()
  ) {
    super(network, config)
  }
}
