import { Amount } from './amount'
import { FeeDefaults } from './fee'

export interface ProtocolMetadata<_Units extends string = string, _FeeUnits extends string = _Units> {
  name: string
  identifier: string // TODO: we should help developers generate unique identifiers somehow

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  fee?: ProtocolFeeMetadata<_FeeUnits>
  account: ProtocolAccountMetadata
  transaction?: ProtocolTransactionMetadata<_Units>
}

export type ProtocolUnitsMetadata<_Units extends string = string> = {
  [key in _Units]: {
    symbol: ProtocolSymbol
    decimals: number
  }
}

export interface ProtocolSymbol {
  value: string
  market?: string
}

export interface ProtocolFeeMetadata<_FeeUnits extends string = string> {
  defaults?: FeeDefaults<_FeeUnits>
  units?: ProtocolUnitsMetadata<_FeeUnits>
  mainUnit?: _FeeUnits
}

export interface ProtocolAccountMetadata {
  standardDerivationPath: string

  address?: {
    isCaseSensitive?: boolean // where do we use this?
    placeholder?: string
    regex?: string
  }
}

export interface ProtocolTransactionMetadata<_Units extends string = string> {
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
