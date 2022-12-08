import { AirGapTransaction } from '@airgap/module-kit'
import { SubstrateTransactionCursor } from '../types/transaction'

export interface SubstrateBlockExplorer {
  getTransactions<_Units extends string>(
    address: string,
    protocolUnit: _Units,
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<Partial<AirGapTransaction<_Units>>[]>
}
