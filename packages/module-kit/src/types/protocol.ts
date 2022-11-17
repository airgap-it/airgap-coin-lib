import { FeeDefaults } from './fee'

export interface ProtocolMetadata<_Units extends string> {
  name: string
  identifier: string // TODO: we should help developers generate unique identifiers somehow

  units: { [key in _Units]: ProtocolUnit }
  mainUnit: _Units

  fee: ProtocolFeeMetadata<_Units>
  account?: ProtocolAccountMetadata
}

export interface ProtocolUnit {
  symbol: ProtocolSymbol
  decimals: number
}

export interface ProtocolSymbol {
  value: string
  market?: string
}

export interface ProtocolFeeMetadata<_Units extends string> {
  symbol: ProtocolSymbol
  defaults?: FeeDefaults<_Units>
}

export interface ProtocolAccountMetadata {
  standardDerivationPath?: string

  addressIsCaseSensitive?: boolean // where do we use this?
  addressPlaceholder?: string
  addressRegex?: string
}

export type ProtocolNetworkType = 'mainnet' | 'testnet' | 'custom'

export interface ProtocolNetwork {
  identifier: string
  name: string
  type: ProtocolNetworkType
  rpcUrl: string
}
