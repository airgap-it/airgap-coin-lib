import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://ae-epoch-rpc-proxy.gke.papers.tech'

const BLOCK_EXPLORER_URL: string = 'https://mainnet.aeternal.io'

export class AeternalBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/transactions/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/transaction/${transactionId}`
  }
}

export class AeternityProtocolNetwork implements ProtocolNetwork<undefined> {
  constructor(
    public readonly name: string = MAINNET_NAME,
    public readonly type: NetworkType = NetworkType.MAINNET,
    public readonly rpcUrl: string = NODE_URL,
    public readonly blockExplorer: ProtocolBlockExplorer = new AeternalBlockExplorer(),
    // tslint:disable-next-line:no-unnecessary-initializer
    public readonly extras: undefined = undefined
  ) {}
}

export class AeternityProtocolOptions implements ProtocolOptions<undefined> {
  constructor(
    public readonly network: AeternityProtocolNetwork = new AeternityProtocolNetwork(),
    // tslint:disable-next-line:no-unnecessary-initializer
    public readonly config: undefined = undefined
  ) {}
}
