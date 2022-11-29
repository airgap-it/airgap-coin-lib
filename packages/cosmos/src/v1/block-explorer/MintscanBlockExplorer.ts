import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

const BLOCK_EXPLORER_URL: string = 'https://www.mintscan.io'

export class MintscanBlockExplorer implements AirGapBlockExplorer {
  private readonly metadata: BlockExplorerMetadata = {
    name: 'Mintscan',
    url: this.url
  }

  public constructor(private readonly url: string = BLOCK_EXPLORER_URL) {}

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/cosmos/account/${address}/`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/cosmos/txs/${transactionId}`
  }
}
