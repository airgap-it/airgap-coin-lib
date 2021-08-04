// tslint:disable: max-classes-per-file
import { ProtocolBlockExplorer } from '../../../../utils/ProtocolBlockExplorer'
import { NetworkType } from '../../../../utils/ProtocolNetwork'
import { SubscanBlockExplorer } from '../../SubstrateProtocolOptions'

import {
  MoonbeamProtocolConfig,
  MoonbeamProtocolNetwork,
  MoonbeamProtocolNetworkExtras,
  MoonbeamProtocolOptions
} from '../MoonbeamProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://rpc.testnet.moonbeam.network'

const BLOCK_EXPLORER_URL: string = 'https://moonbase.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://moonbase.subscan.io/api/scan'

export class MoonbaseProtocolConfig extends MoonbeamProtocolConfig {}

export class MoonbaseProtocolNetworkExtras extends MoonbeamProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API) {
    super(apiUrl)
  }
}

export class MoonbaseSubscanBlockExplorer extends SubscanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class MoonbaseProtocolNetwork extends MoonbeamProtocolNetwork<MoonbaseProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new MoonbaseSubscanBlockExplorer(),
    extras: MoonbaseProtocolNetworkExtras = new MoonbaseProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class MoonbaseProtocolOptions extends MoonbeamProtocolOptions<MoonbaseProtocolConfig> {
  constructor(
    public readonly network: MoonbaseProtocolNetwork = new MoonbaseProtocolNetwork(),
    public readonly config: MoonbaseProtocolConfig = new MoonbaseProtocolConfig()
  ) {
    super(network, config)
  }
}
