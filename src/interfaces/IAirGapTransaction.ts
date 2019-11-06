import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: BigNumber
  fee: BigNumber
  timestamp?: number

  protocolIdentifier: string

  hash?: string
  blockHeight?: string
  data?: string

  meta?: {}
}
