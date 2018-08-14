import BigNumber from 'bignumber.js'

export interface IAirGapTransaction {

  from: string[]
  to: string[]
  isInbound: boolean
  amount: BigNumber
  fee: BigNumber
  timestamp: number

  protocolIdentifier: string

  hash?: string
  blockHeight?: string
  data?: string

  meta?: {

  }

}
