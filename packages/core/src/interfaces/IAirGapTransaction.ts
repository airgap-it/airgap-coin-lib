import { AeternityTransactionCursor } from '../protocols/aeternity/AeternityTypes'
import { EthereumTransactionCursor } from '../protocols/ethereum/EthereumTypes'
import { ProtocolNetwork } from '../utils/ProtocolNetwork'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

import { BitcoinBlockbookTransactionCursor, BitcoinTransactionCursor } from './../protocols/bitcoin/BitcoinTypes'
import { CosmosTransactionCursor } from './../protocols/cosmos/CosmosTypes'
import { SubstrateTransactionCursor } from './../protocols/substrate/SubstrateTypes'
import { TezosTransactionCursor } from './../protocols/tezos/types/TezosTransactionCursor'

export enum AirGapTransactionType {
  SPEND = 'Spend Transaction',
  DELEGATE = 'Delegation',
  UNDELEGATE = 'Undelegate'
}

export enum AirGapTransactionStatus {
  APPLIED = 'applied',
  FAILED = 'failed'
}

export enum AirGapTransactionWarningType {
  SUCCESS = 'success',
  NOTE = 'note',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface AirGapTransactionWarning {
  type: AirGapTransactionWarningType
  title: string
  description: string
  icon?: string
  actions?: ({ text: string; link: string } | { text: string; action(): Promise<void> })[]
}

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: string
  fee: string
  timestamp?: number

  protocolIdentifier: ProtocolSymbols

  network: ProtocolNetwork

  hash?: string
  blockHeight?: string
  data?: string

  extra?: any
  status?: AirGapTransactionStatus

  warnings?: AirGapTransactionWarning[]

  transactionDetails?: any
}

export type IProtocolTransactionCursor =
  | EthereumTransactionCursor
  | BitcoinTransactionCursor
  | TezosTransactionCursor
  | AeternityTransactionCursor
  | SubstrateTransactionCursor
  | CosmosTransactionCursor
  | BitcoinBlockbookTransactionCursor

export interface IAirGapTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: IProtocolTransactionCursor
}
