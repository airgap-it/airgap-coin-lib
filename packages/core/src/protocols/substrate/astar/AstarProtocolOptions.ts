// tslint:disable:max-classes-per-file

import { ProtocolBlockExplorer, SubstrateNodeClient } from '../../..'
import { NetworkType, ProtocolNetwork } from '../../../utils/ProtocolNetwork'
import { SubstrateAccountController } from '../common/SubstrateAccountController'
import { SubstrateTransactionController } from '../common/SubstrateTransactionController'
import { SubstrateNetwork } from '../SubstrateNetwork'
import {
  SubscanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetworkExtras,
  SubstrateProtocolOptions
} from '../SubstrateProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://astar.api.onfinality.io/public'

const BLOCK_EXPLORER_URL: string = 'https://astar.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://astar.subscan.prod.gke.papers.tech/api/scan'

export class AstarProtocolConfig extends SubstrateProtocolConfig {
  constructor() {
    super()
  }
}

export class AstarSubscanBlockExplorer extends SubscanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class AstarProtocolNetworkExtras extends SubstrateProtocolNetworkExtras<SubstrateNetwork.ASTAR> {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {
    super(apiUrl, SubstrateNetwork.ASTAR)
  }
}

export class AstarProtocolNetwork extends ProtocolNetwork<AstarProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new AstarSubscanBlockExplorer(),
    extras: AstarProtocolNetworkExtras = new AstarProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class AstarProtocolOptions extends SubstrateProtocolOptions<SubstrateNetwork.ASTAR, AstarProtocolConfig> {
  constructor(
    public readonly network: AstarProtocolNetwork = new AstarProtocolNetwork(),
    public readonly config: AstarProtocolConfig = new AstarProtocolConfig(),
    nodeClient: SubstrateNodeClient<SubstrateNetwork.ASTAR> = new SubstrateNodeClient(network.extras.network, network.rpcUrl)
  ) {
    super(
      network,
      config,
      nodeClient,
      new SubstrateAccountController(network.extras.network, nodeClient),
      new SubstrateTransactionController(network.extras.network, nodeClient)
    )
  }
}
