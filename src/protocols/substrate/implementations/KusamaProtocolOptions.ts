// tslint:disable:max-classes-per-file

import { ProtocolBlockExplorer } from '../../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../../utils/ProtocolOptions'
import { SubstrateBlockExplorerClient } from '../helpers/blockexplorer/SubstrateBlockExplorerClient'
import { SubstrateNodeClient } from '../helpers/node/SubstrateNodeClient'
import { SubstrateAccountController } from '../helpers/SubstrateAccountController'
import { SubstrateTransactionController } from '../helpers/SubstrateTransactionController'
import { SubstrateNetwork } from '../SubstrateNetwork'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://polkadot-kusama-node.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://polkascan.io/kusama'
const BLOCK_EXPLORER_API: string = 'https://api-01.polkascan.io/kusama/api/v1'

export class KusamaProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {}
}

export class PolkascanBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/extrinsic/${transactionId}`
  }
}

export class KusamaProtocolConfig {
  constructor(
    public readonly network: SubstrateNetwork = SubstrateNetwork.KUSAMA,
    public readonly nodeClient: SubstrateNodeClient = new SubstrateNodeClient(network, NODE_URL),
    public readonly blockExplorerClient: SubstrateBlockExplorerClient = new SubstrateBlockExplorerClient(
      network,
      BLOCK_EXPLORER_URL,
      BLOCK_EXPLORER_API
    ),
    public readonly accountController: SubstrateAccountController = new SubstrateAccountController(network, nodeClient),
    public readonly transactionController: SubstrateTransactionController = new SubstrateTransactionController(network, nodeClient)
  ) {}
}

export class KusamaProtocolNetwork extends ProtocolNetwork<KusamaProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new PolkascanBlockExplorer(),
    extras: KusamaProtocolNetworkExtras = new KusamaProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class KusamaProtocolOptions implements ProtocolOptions<KusamaProtocolConfig> {
  constructor(
    public readonly network: KusamaProtocolNetwork = new KusamaProtocolNetwork(),
    public readonly config: KusamaProtocolConfig = new KusamaProtocolConfig()
  ) {}
}
