import { ProtocolBlockExplorer } from '@airgap/coinlib-core/utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '@airgap/coinlib-core/utils/ProtocolNetwork'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'
import { SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

export const NODE_URL: string = 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://etherscan.io'
export const BLOCK_EXPLORER_API: string = 'https://api.etherscan.io'

export class EthereumProtocolNetworkExtras {
  constructor(public readonly chainID: number = 1, public readonly blockExplorerApi: string = BLOCK_EXPLORER_API) {}
}

export class EtherscanBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/address/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/tx/${transactionId}`
  }
}

export class EthereumProtocolNetwork extends ProtocolNetwork<EthereumProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new EtherscanBlockExplorer(),
    extras: EthereumProtocolNetworkExtras = new EthereumProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class EthereumProtocolConfig {
  constructor() {}
}

export class EthereumProtocolOptions implements ProtocolOptions<EthereumProtocolConfig> {
  public readonly nodeClient: EthereumNodeClient
  public readonly infoClient: EthereumInfoClient

  constructor(
    public readonly network: EthereumProtocolNetwork = new EthereumProtocolNetwork(),
    public readonly config: EthereumProtocolConfig = new EthereumProtocolConfig()
  ) {
    this.nodeClient = new AirGapNodeClient(network.rpcUrl)
    this.infoClient = new EtherscanInfoClient(network.extras.blockExplorerApi)
  }
}

export class EthereumERC20ProtocolConfig {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly marketSymbol: string,
    public readonly identifier: SubProtocolSymbols,
    public readonly contractAddress: string,
    public readonly decimals: number
  ) {}
}

export class EthereumERC20ProtocolOptions extends EthereumProtocolOptions {
  constructor(
    public readonly network: EthereumProtocolNetwork = new EthereumProtocolNetwork(),
    public readonly config: EthereumERC20ProtocolConfig
  ) {
    super(network, config)
  }
}
