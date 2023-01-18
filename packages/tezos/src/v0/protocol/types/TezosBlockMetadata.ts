import { TezosBlockHeader } from './TezosBlockHeader'

export interface TezosBlockMetadata {
  protocol: string
  chain_id: string
  hash: string
  metadata: TezosBlockHeader
}
