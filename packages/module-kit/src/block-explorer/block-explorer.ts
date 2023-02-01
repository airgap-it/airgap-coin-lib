import { AirGapInterface } from '../types/airgap'
import { BlockExplorerMetadata } from '../types/block-explorer'

// ##### Block Explorer #####

export interface BlockExplorer {
  getMetadata(): Promise<BlockExplorerMetadata>

  createAddressUrl(address: string): Promise<string>
  createTransactionUrl(transactionId: string): Promise<string>
}

// ##### Convinience Types #####

export type AirGapBlockExplorer = AirGapInterface<BlockExplorer>
