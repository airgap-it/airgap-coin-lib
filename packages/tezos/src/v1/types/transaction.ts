import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

import { TezosSaplingInput } from './sapling/TezosSaplingInput'
import { TezosSaplingOutput } from './sapling/TezosSaplingOutput'
import { TezosSaplingStateDiff } from './sapling/TezosSaplingStateDiff'

export interface TezosUnsignedTransaction extends UnsignedTransaction {
  binary: string
}
export interface TezosSignedTransaction extends SignedTransaction {
  binary: string
}

export interface TezosSaplingUnsignedTransaction extends UnsignedTransaction {
  ins: TezosSaplingInput[]
  outs: TezosSaplingOutput[]
  contractAddress: string
  chainId: string
  stateDiff: TezosSaplingStateDiff
  unshieldTarget: string
}

export interface TezosSaplingSignedTransaction extends SignedTransaction {
  binary: string
}

export interface TezosTransactionCursor extends TransactionCursor {
  offset: number
}

export interface TezosSaplingTransactionCursor extends TransactionCursor {
  page?: number
}

export interface TezosKtTransactionCursor extends TransactionCursor {
  offsets: Record<string, number>
}
