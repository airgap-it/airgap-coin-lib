import { TezosWrappedOperation } from '../protocols/TezosProtocol'

export interface TezosTransaction {
  transaction: TezosWrappedOperation
  bytes: Buffer
  signature: string
}

export type IAirGapSignedTransaction = string | TezosTransaction
