import { ProtocolMetadata, ProtocolNetwork } from '@airgap/module-kit'

import { TezosBlockExplorer } from './block-explorer'
import { TezosIndexer } from './indexer'
import { TezosNetwork } from './network'
import { TezosSaplingExternalMethodProvider } from './sapling/TezosSaplingExternalMethodProvider'

export type TezosUnits = 'tez' | 'mutez' | 'nanotez'

export type TezosProtocolNetworkResolver = (network: string) => TezosProtocolNetwork

export interface TezosProtocolNetwork extends ProtocolNetwork {
  network: TezosNetwork
  blockExplorer: TezosBlockExplorer
  indexer: TezosIndexer
}

export interface TezosProtocolOptions {
  network: TezosProtocolNetwork
}

export interface TezosSaplingProtocolNetwork extends TezosProtocolNetwork {
  contractAddress?: string
  injectorUrl?: string
}

export interface TezosSaplingProtocolOptions<_Units extends string = string> {
  network: TezosSaplingProtocolNetwork
  metadata: ProtocolMetadata<_Units, TezosUnits>
  memoSize: number
  merkleTreeHeight: number

  externalProvider?: TezosSaplingExternalMethodProvider
}

export interface TezosShieldedTezProtocolOptions {
  network: TezosSaplingProtocolNetwork
  memoSize: number
  merkleTreeHeight: number

  externalProvider?: TezosSaplingExternalMethodProvider
}
