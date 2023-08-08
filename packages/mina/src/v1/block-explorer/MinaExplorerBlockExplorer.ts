import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

export class MinaExplorerBlockExplorer implements AirGapBlockExplorer {
  public constructor(private readonly url: string) {}

  private readonly metadata: BlockExplorerMetadata = {
    name: 'Mina Explorer',
    url: this.url
  }
  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/wallet/${address}`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/transaction/${transactionId}`
  }
}