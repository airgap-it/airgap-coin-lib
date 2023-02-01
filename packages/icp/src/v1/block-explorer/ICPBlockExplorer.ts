import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

const BLOCK_EXPLORER_URL: string = 'https://dashboard.internetcomputer.org/'

export class ICPBlockExplorer implements AirGapBlockExplorer {
  public constructor(public readonly url: string = BLOCK_EXPLORER_URL) {}

  private readonly metadata: BlockExplorerMetadata = {
    name: 'ICP Explorer',
    url: this.url
  }

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/account/${address}`
  }
  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/transaction/${transactionId}`
  }
}
