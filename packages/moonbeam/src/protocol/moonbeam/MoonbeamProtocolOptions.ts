// tslint:disable: max-classes-per-file
import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'
import {
  SubscanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetworkExtras,
  SubstrateProtocolOptions
} from '@airgap/substrate/v0/protocol/SubstrateProtocolOptions'

import { MoonbeamAccountController } from './controllers/MoonbeamAccountController'
import { MoonbeamTransactionController } from './controllers/MoonbeamTransactionController'
import { MoonbeamNodeClient } from './node/MoonbeamNodeClient'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://moonbeam-proxy.airgap.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://moonbeam.subscan.io'
const BLOCK_EXPLORER_API: string = 'https://moonbeam.subscan.prod.gke.papers.tech/api/scan'

export class MoonbeamProtocolConfig extends SubstrateProtocolConfig {}

export class MoonbeamProtocolNetworkExtras extends SubstrateProtocolNetworkExtras<SubstrateNetwork.MOONBEAM> {
  constructor(public readonly apiUrl: string) {
    super(apiUrl, SubstrateNetwork.MOONBEAM)
  }
}

export class MoonbeamSubscanBlockExplorer extends SubscanBlockExplorer {
  constructor(blockExplorer: string = BLOCK_EXPLORER_URL) {
    super(blockExplorer)
  }
}

export class BaseMoonbeamProtocolNetwork<
  Extras extends MoonbeamProtocolNetworkExtras = MoonbeamProtocolNetworkExtras
> extends ProtocolNetwork<Extras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string,
    blockExplorer: ProtocolBlockExplorer,
    extras: Extras
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class MoonbeamProtocolNetwork extends BaseMoonbeamProtocolNetwork {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new MoonbeamSubscanBlockExplorer(),
    extras: MoonbeamProtocolNetworkExtras = new MoonbeamProtocolNetworkExtras(BLOCK_EXPLORER_API)
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class BaseMoonbeamProtocolOptions<Config extends MoonbeamProtocolConfig = MoonbeamProtocolConfig> extends SubstrateProtocolOptions<
  SubstrateNetwork.MOONBEAM,
  Config,
  MoonbeamNodeClient,
  MoonbeamAccountController,
  MoonbeamTransactionController
> {
  constructor(
    public readonly network: MoonbeamProtocolNetwork,
    public readonly config: Config,
    nodeClient: MoonbeamNodeClient = new MoonbeamNodeClient(network.extras.network, network.rpcUrl)
  ) {
    super(
      network,
      config,
      nodeClient,
      new MoonbeamAccountController(SubstrateNetwork.MOONBEAM, nodeClient),
      new MoonbeamTransactionController(SubstrateNetwork.MOONBEAM, nodeClient)
    )
  }
}

export class MoonbeamProtocolOptions extends BaseMoonbeamProtocolOptions {
  constructor(
    public readonly network: MoonbeamProtocolNetwork = new MoonbeamProtocolNetwork(),
    public readonly config: MoonbeamProtocolConfig = new MoonbeamProtocolConfig()
  ) {
    super(network, config)
  }
}
