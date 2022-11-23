import { BlockExplorerMetadata } from '../types/block-explorer'

export interface AirGapBlockExplorer {
  getMetadata(): Promise<BlockExplorerMetadata>

  createAddressUrl(address: string): Promise<string>
  createTransactionUrl(transactionId: string): Promise<string>
}
