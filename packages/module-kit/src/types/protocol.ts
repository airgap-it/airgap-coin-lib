import { FeeDefaults } from './fee'

export interface ProtocolMetadata<_Units extends string> {
  name: string
  identifier: string // TODO: we should help developers generate unique identifiers somehow

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  fee?: ProtocolFeeMetadata<_Units>
  account?: ProtocolAccountMetadata
  transaction?: ProtocolTransactionMetadata
}

export type ProtocolUnitsMetadata<_Units extends string> = {
  [key in _Units]: {
    symbol: ProtocolSymbol
    decimals: number
  }
}

export interface ProtocolSymbol {
  value: string
  market?: string
}

export interface ProtocolFeeMetadata<_Units extends string> {
  defaults?: FeeDefaults<_Units>
}

export interface ProtocolAccountMetadata {
  standardDerivationPath?: string

  address?: {
    isCaseSensitive?: boolean // where do we use this?
    placeholder?: string
    regex?: string
  }
}

export interface ProtocolTransactionMetadata {
  arbitraryData?:
    | ProtocolTransactionArbitraryDataMetadata
    | {
        // TODO: better names?
        root?: ProtocolTransactionArbitraryDataMetadata
        inner?: ProtocolTransactionArbitraryDataMetadata
      }
}

export interface ProtocolTransactionArbitraryDataMetadata {
  name: string // e.g. 'payload', 'memo'
  maxLength?: number
  regex?: string
}

export type ProtocolNetworkType = 'mainnet' | 'testnet' | 'custom'

export interface ProtocolNetwork {
  name: string
  type: ProtocolNetworkType
  rpcUrl: string
}
