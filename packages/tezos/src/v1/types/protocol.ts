import { ProtocolNetwork } from '@airgap/module-kit'

import { TezosBlockExplorer } from './block-explorer'
import { TezosIndexer } from './indexer'
import { TezosNetwork } from './network'

export type TezosUnits = 'tez' | 'mutez' | 'nanotez'

export interface TezosProtocolNetwork extends ProtocolNetwork {
  network: TezosNetwork
  blockExplorer: TezosBlockExplorer
  indexer: TezosIndexer
}

export interface TezosProtocolOptions {
  network: TezosProtocolNetwork
}
