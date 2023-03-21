import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

const BLOCK_EXPLORER_URL: string = 'https://explorer.mainnet-1.coreum.dev'

export class CoreumBlockExplorer implements AirGapBlockExplorer {
  private readonly metadata: BlockExplorerMetadata = {
    name: 'Coreum Explorer',
    url: this.url
  }

  public constructor(private readonly url: string = BLOCK_EXPLORER_URL) {}

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/accounts/${address}`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/transactions/${transactionId}`
  }
}
