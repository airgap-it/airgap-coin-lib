import { FeeDefaults, ProtocolMetadata, ProtocolNetwork, ProtocolUnitsMetadata } from '@airgap/module-kit'

import { TezosBlockExplorerType } from './block-explorer'
import { TezosFA1ContractEntrypoint } from './fa/TezosFA1ContractEntrypoint'
import { TezosFA1p2ContractEntrypoint } from './fa/TezosFA1p2ContractEntrypoint'
import { TezosFA2ContractEntrypoint } from './fa/TezosFA2ContractEntrypoint'
import { TezosIndexerType } from './indexer'
import { TezosNetwork } from './network'
import { TezosSaplingExternalMethodProvider } from './sapling/TezosSaplingExternalMethodProvider'

export type TezosUnits = 'tez' | 'mutez' | 'nanotez'

export type TezosProtocolNetworkResolver = (network: string) => TezosProtocolNetwork

export type TezosUnstakeRequest = {
  delegate?: string
  requests: [
    {
      cycle: number
      amount: string
    }
  ]
}

export interface TezosProtocolNetwork extends ProtocolNetwork {
  network: TezosNetwork
  blockExplorerType: TezosBlockExplorerType
  indexerType: TezosIndexerType
  indexerApi: string
}

export interface TezosProtocolOptions {
  network: TezosProtocolNetwork
}

// Sapling

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

// FA

export interface TezosFAProtocolNetwork extends TezosProtocolNetwork {
  contractAddress: string
  defaultSourceAddress: string

  objktApiUrl: string
  tokenMetadataBigMapId?: number
}

export interface TezosFAProtocolOptions<_Units extends string, _ProtocolNetwork extends TezosFAProtocolNetwork> {
  network: _ProtocolNetwork

  identifier: string
  name: string

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  feeDefaults?: FeeDefaults<TezosUnits>
}

export interface TezosFA1ProtocolNetwork extends TezosFAProtocolNetwork {
  callbackContracts: Record<Extract<TezosFA1ContractEntrypoint, 'getBalance' | 'getTotalSupply'>, string>
}
export interface TezosFA1ProtocolOptions<_Units extends string> extends TezosFAProtocolOptions<_Units, TezosFA1ProtocolNetwork> {}

export interface TezosFA1p2ProtocolNetwork extends TezosFA1ProtocolNetwork {
  callbackContracts: Record<Extract<TezosFA1p2ContractEntrypoint, 'getBalance' | 'getTotalSupply'>, string>
}
export interface TezosFA1p2ProtocolOptions<_Units extends string> extends TezosFA1ProtocolOptions<_Units> {}

export interface TezosFA2ProtocolNetwork extends TezosFAProtocolNetwork {
  tokenId?: number

  totalSupplyBigMapId?: number
  ledgerBigMapId?: number

  callbackContracts: Record<Extract<TezosFA2ContractEntrypoint, 'balance_of'>, string>
}
export interface TezosFA2ProtocolOptions<_Units extends string> extends TezosFAProtocolOptions<_Units, TezosFA2ProtocolNetwork> {}
