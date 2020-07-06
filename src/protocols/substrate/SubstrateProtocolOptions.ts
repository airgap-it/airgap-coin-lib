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
  constructor(public readonly apiUrl: string, public readonly network: SubstrateNetwork) {}
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
  constructor() {}
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

export class SubstrateProtocolOptions<T extends SubstrateProtocolConfig = SubstrateProtocolConfig> implements ProtocolOptions<T> {
  public readonly nodeClient: SubstrateNodeClient
  public readonly blockExplorerClient: SubstrateBlockExplorerClient
  public readonly accountController: SubstrateAccountController
  public readonly transactionController: SubstrateTransactionController

  constructor(public readonly network: SubstrateProtocolNetwork, public readonly config: T) {
    this.nodeClient = new SubstrateNodeClient(network.extras.network, network.rpcUrl)
    this.blockExplorerClient = new SubstrateBlockExplorerClient(network.extras.network, network.extras.apiUrl)
    this.accountController = new SubstrateAccountController(network.extras.network, this.nodeClient)
    this.transactionController = new SubstrateTransactionController(network.extras.network, this.nodeClient)
  }
}
