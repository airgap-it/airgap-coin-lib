import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

import { SubstrateTransaction, SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'

import { SubstrateProtocolConfiguration } from './configuration'

export interface SubstrateUnsignedTransaction extends UnsignedTransaction {
  encoded: string
}

export interface SubstrateSignedTransaction extends SignedTransaction {
  encoded: string
}

export interface SubstrateTransactionCursor extends TransactionCursor {
  page?: number
}

export interface SubstrateTransactionDetails<C extends SubstrateProtocolConfiguration> {
  runtimeVersion: number | undefined
  fee: BigNumber
  transaction: SubstrateTransaction<C>
  payload: string
}

export interface SubstrateTransactionParameters<C extends SubstrateProtocolConfiguration> {
  type: SubstrateTransactionType<C>
  tip: string | number | BigNumber
  args: any
}
