import { ProtocolNetwork } from '../utils/ProtocolNetwork'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'

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
  changeAddressInfo?: any
}

export interface IProtocolTransactionCursor {}

export interface IAirGapTransactionResult<T extends IProtocolTransactionCursor = IProtocolTransactionCursor> {
  transactions: IAirGapTransaction[]
  cursor: T
}
