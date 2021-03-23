import { ProtocolBlockExplorer } from '../../utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from '../../utils/ProtocolNetwork'
import { ProtocolOptions } from '../../utils/ProtocolOptions'

// tslint:disable:max-classes-per-file

const MAINNET_NAME: string = 'Mainnet'

const NODE_URL: string = 'https://mainnet.aeternity.io'

const BLOCK_EXPLORER_URL: string = 'https://mainnet.aeternity.io'

export class AeternalBlockExplorer implements ProtocolBlockExplorer {
  constructor(public readonly blockExplorer: string = BLOCK_EXPLORER_URL) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorer}/account/transactions/${address}`
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorer}/transactions/${transactionId}`
  }
}

export class AeternityProtocolNetwork extends ProtocolNetwork<undefined> {
  constructor(
    name: string = MAINNET_NAME,
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = NODE_URL,
    blockExplorer: ProtocolBlockExplorer = new AeternalBlockExplorer(),
    // tslint:disable-next-line:no-unnecessary-initializer
    extras: undefined = undefined
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class AeternityProtocolOptions implements ProtocolOptions<undefined> {
  constructor(
    public readonly network: AeternityProtocolNetwork = new AeternityProtocolNetwork(),
    // tslint:disable-next-line:no-unnecessary-initializer
    public readonly config: undefined = undefined
  ) {}
}
