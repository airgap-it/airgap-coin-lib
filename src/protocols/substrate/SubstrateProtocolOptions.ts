import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

import { SubstrateBlockExplorerClient } from './helpers/blockexplorer/SubstrateBlockExplorerClient'
import { SubstrateNodeClient } from './helpers/node/SubstrateNodeClient'
import { SubstrateAccountController } from './helpers/SubstrateAccountController'
import { SubstrateTransactionController } from './helpers/SubstrateTransactionController'
import { SubstrateNetwork } from './SubstrateNetwork'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

export class SubstrateProtocolNetworkExtras {
  constructor(public readonly apiUrl: string) {}
}

export class PolkascanBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/extrinsic/${transactionId}`
  }
}

export class SubstrateProtocolConfig {
  constructor(
    public readonly network: SubstrateNetwork,
    public readonly nodeClient: SubstrateNodeClient,
    public readonly blockExplorerClient: SubstrateBlockExplorerClient,
    public readonly accountController: SubstrateAccountController = new SubstrateAccountController(network, nodeClient),
    public readonly transactionController: SubstrateTransactionController = new SubstrateTransactionController(network, nodeClient)
  ) {}
}

export class SubstrateProtocolNetwork extends ProtocolNetwork<SubstrateProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string,
    blockExplorer: ProtocolBlockExplorer,
    extras: SubstrateProtocolNetworkExtras
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class SubstrateProtocolOptions implements ProtocolOptions<SubstrateProtocolConfig> {
  constructor(public readonly network: SubstrateProtocolNetwork, public readonly config: SubstrateProtocolConfig) {}
}
