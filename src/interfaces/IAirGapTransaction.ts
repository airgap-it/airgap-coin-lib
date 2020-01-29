export enum AirGapTransactionType {
  SPEND = 'Spend Transaction',
  DELEGATE = 'Delegation'
}

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: string
  fee: string
  timestamp?: number

  protocolIdentifier: string

  hash?: string
  blockHeight?: string
  data?: string

  extra?: any
  transactionDetails?: any
}
