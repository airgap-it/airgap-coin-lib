import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

export class BlockCypherBlockExplorer implements AirGapBlockExplorer {
  public constructor(public readonly url: string) {}

  private readonly metadata: BlockExplorerMetadata = {
    name: 'BlockCypher',
    url: this.url
  }

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/address/${address}/`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/tx/${transactionId}`
  }
}
