// tslint:disable: max-classes-per-file
import { ProtocolBlockExplorer } from '../../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../../utils/ProtocolNetwork'
import { SubstrateNetwork } from '../SubstrateNetwork'
import { SubstrateProtocolConfig, SubstrateProtocolNetworkExtras, SubstrateProtocolOptions } from '../SubstrateProtocolOptions'

import { MoonbeamAccountController } from './controllers/MoonbeamAccountController'
import { MoonbeamTransactionController } from './controllers/MoonbeamTransactionController'
import { MoonbeamNodeClient } from './node/MoonbeamNodeClient'

const MAINNET_NAME: string = 'Mainnet'

export class MoonbeamProtocolConfig extends SubstrateProtocolConfig {}

export class MoonbeamProtocolNetworkExtras extends SubstrateProtocolNetworkExtras<SubstrateNetwork.MOONBEAM> {
  constructor(public readonly apiUrl: string) {
    super(apiUrl, SubstrateNetwork.MOONBEAM)
  }
}

export class MoonbeamProtocolNetwork<
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

export class MoonbeamProtocolOptions<Config extends MoonbeamProtocolConfig = MoonbeamProtocolConfig> extends SubstrateProtocolOptions<
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
