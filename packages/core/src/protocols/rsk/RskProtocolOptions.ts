import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'
import { SubProtocolSymbols } from '../../utils/ProtocolSymbols'

import { RskExplorerInfoClient } from './clients/info-clients/RskExplorerInfoClient'
import { RskInfoClient } from './clients/info-clients/InfoClient'
import { AirGapNodeClientRsk } from './clients/node-clients/AirGapNodeClientRsk'
import { RskNodeClient } from './clients/node-clients/RskNodeClient'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'RSK Mainnet'

export const NODE_URL: string = 'https://public-node.rsk.co'

const BLOCK_EXPLORER_URL: string = 'https://explorer.rsk.co'
export const BLOCK_EXPLORER_API: string = 'https://blockscout.com/rsk/mainnet/' // TODO: Consider adding rsk explorer api

export class RskProtocolNetworkExtras {
  constructor(public readonly chainID: number = 30, public readonly blockExplorerApi: string = BLOCK_EXPLORER_API) {}
}

export class RskExplorerBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/address/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/tx/${transactionId}`
  }
}

export class RskProtocolNetwork extends ProtocolNetwork<RskProtocolNetworkExtras> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new RskExplorerBlockExplorer(),
    extras: RskProtocolNetworkExtras = new RskProtocolNetworkExtras()
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class RskProtocolConfig {
  constructor() {}
}

export class RskProtocolOptions implements ProtocolOptions<RskProtocolConfig> {
  public readonly nodeClient: RskNodeClient
  public readonly infoClient: RskInfoClient

  constructor(
    public readonly network: RskProtocolNetwork = new RskProtocolNetwork(),
    public readonly config: RskProtocolConfig = new RskProtocolConfig()
  ) {
    this.nodeClient = new AirGapNodeClientRsk(network.rpcUrl)
    this.infoClient = new RskExplorerInfoClient(network.extras.blockExplorerApi)
  }
}

export class RskERC20ProtocolConfig {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly marketSymbol: string,
    public readonly identifier: SubProtocolSymbols,
    public readonly contractAddress: string,
    public readonly decimals: number
  ) {}
}

export class RskERC20ProtocolOptions extends RskProtocolOptions {
  constructor(public readonly network: RskProtocolNetwork = new RskProtocolNetwork(), public readonly config: RskERC20ProtocolConfig) {
    super(network, config)
  }
}
