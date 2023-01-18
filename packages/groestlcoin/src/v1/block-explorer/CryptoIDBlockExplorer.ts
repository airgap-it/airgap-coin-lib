import { AirGapBlockExplorer, BlockExplorerMetadata } from '@airgap/module-kit'

export const CRYPTOID_MAINNET_URL = 'https://chainz.cryptoid.info/grs'
export const CRYPTOID_TESTNET_URL = 'https://chainz.cryptoid.info/grs-test'

export class CryptoIDBlockExplorer implements AirGapBlockExplorer {
  public constructor(public readonly url: string = CRYPTOID_MAINNET_URL) {}

  private readonly metadata: BlockExplorerMetadata = {
    name: 'cryptoID',
    url: this.url
  }

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/address.dws?${address}.htm`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/tx.dws?${transactionId}.htm`
  }
}
