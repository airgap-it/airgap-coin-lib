// tslint:disable:max-classes-per-file

import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { SubstrateNodeClient } from '@airgap/substrate/protocol/common/node/SubstrateNodeClient'
import { SubstrateAccountController } from '@airgap/substrate/protocol/common/SubstrateAccountController'
import { SubstrateTransactionController } from '@airgap/substrate/protocol/common/SubstrateTransactionController'
import { SubstrateNetwork } from '@airgap/substrate/protocol/SubstrateNetwork'
import {
  SubscanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetworkExtras,
  SubstrateProtocolOptions
} from '@airgap/substrate/protocol/SubstrateProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://polkadot-kusama-node.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://kusama.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://kusama.subscan.prod.gke.papers.tech/api/scan'

export class KusamaProtocolNetworkExtras extends SubstrateProtocolNetworkExtras<SubstrateNetwork.KUSAMA> {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {
    super(apiUrl, SubstrateNetwork.KUSAMA)
  }
}

export class KusamaSubscanBlockExplorer extends SubscanBlockExplorer {
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
    blockExplorer: ProtocolBlockExplorer = new KusamaSubscanBlockExplorer(),
    extras: KusamaProtocolNetworkExtras = new KusamaProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class KusamaProtocolOptions extends SubstrateProtocolOptions<SubstrateNetwork.KUSAMA, KusamaProtocolConfig> {
  constructor(
    public readonly network: KusamaProtocolNetwork = new KusamaProtocolNetwork(),
    public readonly config: KusamaProtocolConfig = new KusamaProtocolConfig(),
    nodeClient: SubstrateNodeClient<SubstrateNetwork.KUSAMA> = new SubstrateNodeClient(network.extras.network, network.rpcUrl)
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
