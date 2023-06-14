import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

export class EtherscanBlockExplorer implements AirGapBlockExplorer {
  private readonly metadata: BlockExplorerMetadata = {
    name: 'Etherscan',
    url: this.url
  }

  public constructor(private readonly url: string) {}

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/address/${address}`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/tx/${transactionId}`
  }
}
