import { Amount } from './amount'
import { FeeDefaults } from './fee'

export interface ProtocolMetadata<_Units extends string, _FeeUnits extends string = _Units> {
  name: string
  identifier: string // TODO: we should help developers generate unique identifiers somehow

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  fee?: ProtocolFeeMetadata<_FeeUnits>
  account?: ProtocolAccountMetadata
  transaction?: ProtocolTransactionMetadata<_Units>
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

interface ProtocolFeeMetadataWithUnits<_FeeUnits extends string> {
  units: ProtocolUnitsMetadata<_FeeUnits>
  mainUnit: _FeeUnits
  defaults?: FeeDefaults<_FeeUnits>
}

interface ProtocolFeeMetadataWithoutUnits<_FeeUnits extends string> {
  defaults?: FeeDefaults<_FeeUnits>
}

export type ProtocolFeeMetadata<_FeeUnits extends string> =
  | ProtocolFeeMetadataWithoutUnits<_FeeUnits>
  | ProtocolFeeMetadataWithUnits<_FeeUnits>

export interface ProtocolAccountMetadata {
  standardDerivationPath?: string

  address?: {
    isCaseSensitive?: boolean // where do we use this?
    placeholder?: string
    regex?: string
  }
}

export interface ProtocolTransactionMetadata<_Units extends string> {
  arbitraryData?:
    | ProtocolTransactionArbitraryDataMetadata
    | {
        // TODO: better names?
        root?: ProtocolTransactionArbitraryDataMetadata
        inner?: ProtocolTransactionArbitraryDataMetadata
      }

  minBalance?: {
    amount: Amount<_Units>
    name?: string
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
