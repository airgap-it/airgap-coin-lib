import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

import { SubstrateBlockExplorerClient } from './common/blockexplorer/SubstrateBlockExplorerClient'
import { SubstrateNodeClient } from './common/node/SubstrateNodeClient'
import { SubstrateAccountController } from './common/SubstrateAccountController'
import { SubstrateTransactionController } from './common/SubstrateTransactionController'
import { SubstrateNetwork } from './SubstrateNetwork'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

export class SubstrateProtocolNetworkExtras<T extends SubstrateNetwork> {
  constructor(public readonly apiUrl: string, public readonly network: T) {}
}

export class SubscanBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/extrinsic/${transactionId}`
  }
}

export class SubstrateProtocolConfig {
  constructor() {}
}

export class SubstrateProtocolNetwork<T extends SubstrateNetwork> extends ProtocolNetwork<SubstrateProtocolNetworkExtras<T>> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string,
    blockExplorer: ProtocolBlockExplorer,
    extras: SubstrateProtocolNetworkExtras<T>
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class SubstrateProtocolOptions<
  Network extends SubstrateNetwork,
  Config extends SubstrateProtocolConfig = SubstrateProtocolConfig,
  NodeClient extends SubstrateNodeClient<Network> = SubstrateNodeClient<Network>,
  AccountController extends SubstrateAccountController<Network, NodeClient> = SubstrateAccountController<Network, NodeClient>,
  TransactionController extends SubstrateTransactionController<Network> = SubstrateTransactionController<Network>
> implements ProtocolOptions<Config>
{
  public readonly blockExplorerClient: SubstrateBlockExplorerClient

  constructor(
    public readonly network: SubstrateProtocolNetwork<Network>,
    public readonly config: Config,
    public readonly nodeClient: NodeClient,
    public readonly accountController: AccountController,
    public readonly transactionController: TransactionController
  ) {
    this.blockExplorerClient = new SubstrateBlockExplorerClient(network.extras.network, network.extras.apiUrl)
  }
}
