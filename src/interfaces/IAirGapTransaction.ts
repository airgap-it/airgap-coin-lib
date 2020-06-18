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

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: string
  fee: string
  timestamp?: number

  protocolIdentifier: ProtocolSymbols

  hash?: string
  blockHeight?: string
  data?: string

  extra?: any
  status?: AirGapTransactionStatus

  transactionDetails?: any
}
