import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'
import { SubProtocolSymbols } from '../../utils/ProtocolSymbols'

import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://etherscan.io'

export class EthereumProtocolNetworkExtras {
  constructor(
    public readonly chainID: number = 1,
    public readonly nodeClient: EthereumNodeClient = new AirGapNodeClient(),
    public readonly infoClient: EthereumInfoClient = new EtherscanInfoClient()
  ) { }
}

export class EtherscanBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) { }

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/address/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/tx/${transactionId}`
  }
}

export class EthereumProtocolNetwork extends ProtocolNetwork<EthereumProtocolNetworkExtras> {
  constructor(
    public readonly name: string = MAINNET_NAME,
    public readonly type: NetworkType = NetworkType.MAINNET,
    public readonly rpcUrl: string = NODE_URL,
    public readonly blockExplorer: ProtocolBlockExplorer = new EtherscanBlockExplorer(),
    public readonly extras: EthereumProtocolNetworkExtras = new EthereumProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class EthereumProtocolConfig {
  constructor() { }
}

export class EthereumProtocolOptions implements ProtocolOptions<EthereumProtocolConfig> {
  constructor(
    public readonly network: EthereumProtocolNetwork = new EthereumProtocolNetwork(),
    public readonly config: EthereumProtocolConfig = new EthereumProtocolConfig()
  ) { }
}

export class EthereumERC20ProtocolConfig {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly marketSymbol: string,
    public readonly identifier: SubProtocolSymbols,
    public readonly contractAddress: string,
    public readonly decimals: number,
  ) { }
}

export class EthereumERC20ProtocolOptions implements ProtocolOptions<EthereumERC20ProtocolConfig> {
  constructor(
    public readonly network: EthereumProtocolNetwork = new EthereumProtocolNetwork(),
    public readonly config: EthereumERC20ProtocolConfig
  ) { }
}
