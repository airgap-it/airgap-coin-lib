import { HexString, SignedTransaction, TransactionConfiguration, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

import { BitcoinUnits } from './protocol'

export interface BitcoinInTransaction {
  txId: string
  value: string
  vout: number
  address: string
  derivationPath?: string
}

export interface BitcoinOutTransaction {
  recipient: string
  isChange: boolean
  value: string
  derivationPath?: string
}

export interface BitcoinUnsignedTransaction extends UnsignedTransaction {
  ins: BitcoinInTransaction[]
  outs: BitcoinOutTransaction[]
}

export interface BitcoinSignedTransaction extends SignedTransaction {
  from: string[]
  to: string[]
  amount: string
  fee: string
  transaction: string
}

export interface BitcoinSegwitUnsignedTransaction extends UnsignedTransaction {
  psbt: string
}

export interface BitcoinSegwitSignedTransaction extends SignedTransaction {
  psbt: string
}

export interface BitcoinTransactionCursor extends TransactionCursor {
  page?: number
}

export type SegwitTransactionConfiguration<_Units extends BitcoinUnits> = TransactionConfiguration<_Units> & {
  masterFingerprint: HexString
  replaceByFee?: boolean
}
