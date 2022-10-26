// tslint:disable: max-classes-per-file
import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { SubscanBlockExplorer } from '@airgap/substrate/protocol/SubstrateProtocolOptions'

import {
  BaseMoonbeamProtocolNetwork,
  BaseMoonbeamProtocolOptions,
  MoonbeamProtocolConfig,
  MoonbeamProtocolNetworkExtras
} from '../moonbeam/MoonbeamProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://moonriver-proxy.airgap.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://moonriver.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://moonriver.subscan.prod.gke.papers.tech/api/scan'

export class MoonriverProtocolConfig extends MoonbeamProtocolConfig {}

export class MoonriverProtocolNetworkExtras extends MoonbeamProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {
    super(apiUrl)
  }
}

export class MoonriverSubscanBlockExplorer extends SubscanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class MoonriverProtocolNetwork extends BaseMoonbeamProtocolNetwork<MoonriverProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new MoonriverSubscanBlockExplorer(),
    extras: MoonriverProtocolNetworkExtras = new MoonriverProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class MoonriverProtocolOptions extends BaseMoonbeamProtocolOptions<MoonriverProtocolConfig> {
  constructor(
    public readonly network: MoonriverProtocolNetwork = new MoonriverProtocolNetwork(),
    public readonly config: MoonriverProtocolConfig = new MoonriverProtocolConfig()
  ) {
    super(network, config)
  }
}
