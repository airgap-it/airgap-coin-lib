import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

const BLOCK_EXPLORER_URL: string = 'https://explorer.aeternity.io'

export class AeternityBlockExplorer implements AirGapBlockExplorer {
  public constructor(public readonly url: string = BLOCK_EXPLORER_URL) {}

  private readonly metadata: BlockExplorerMetadata = {
    name: 'æternity Explorer',
    url: this.url
  }

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/account/transactions/${address}`
  }
  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/transactions/${transactionId}`
  }
}
