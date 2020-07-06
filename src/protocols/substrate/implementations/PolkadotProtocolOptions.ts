// tslint:disable:max-classes-per-file

import { ProtocolBlockExplorer } from '../../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../../utils/ProtocolNetwork'
import { SubstrateNetwork } from '../SubstrateNetwork'
import { SubstrateProtocolConfig, SubstrateProtocolOptions } from '../SubstrateProtocolOptions'

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://polkadot-node.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://polkascan.io/polkadot-cc1'
const BLOCK_EXPLORER_API: string = 'https://api-01.polkascan.io/polkadot/api/v1'

export class PolkadotProtocolNetworkExtras {
  constructor(public readonly apiUrl: string = BLOCK_EXPLORER_API, public readonly network: SubstrateNetwork = SubstrateNetwork.POLKADOT) {}
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

export class PolkadotProtocolConfig extends SubstrateProtocolConfig {
  constructor() {
    super()
  }
}

export class PolkadotProtocolNetwork extends ProtocolNetwork<PolkadotProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new PolkascanBlockExplorer(),
    extras: PolkadotProtocolNetworkExtras = new PolkadotProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class PolkadotProtocolOptions extends SubstrateProtocolOptions<PolkadotProtocolConfig> {
  constructor(
    public readonly network: PolkadotProtocolNetwork = new PolkadotProtocolNetwork(),
    public readonly config: PolkadotProtocolConfig = new PolkadotProtocolConfig()
  ) {
    super(network, config)
  }
}
