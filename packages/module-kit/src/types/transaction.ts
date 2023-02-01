import { Address } from './address'
import { Amount } from './amount'
import { BaseCursor } from './base/cursor'
import { Sealed } from './base/sealed'
import { ProtocolNetwork } from './protocol'
import { AirGapUIAlert } from './ui/alert'
import { AirGapUIText } from './ui/text'

// ##### Transaction #####

export type TransactionType = 'unsigned' | 'signed'

interface BaseTransaction<_Type extends TransactionType> extends Sealed<_Type> {}

export interface UnsignedTransaction extends BaseTransaction<'unsigned'> {}
export interface SignedTransaction extends BaseTransaction<'signed'> {}

export interface AirGapTransaction<_Units extends string = string, _FeeUnits extends string = _Units> {
  from: string[]
  to: string[]
  isInbound: boolean

  amount: Amount<_Units>
  fee: Amount<_FeeUnits>

  network: ProtocolNetwork

  timestamp?: number
  status?: AirGapTransactionStatus
  type?: string | { name: string; [key: string]: string }

  uiAlerts?: AirGapUIAlert[]

  arbitraryData?: string | [AirGapUIText, string]
  json?: any
  extra?: any
}

export interface TransactionCursor extends BaseCursor {}

export interface AirGapTransactionsWithCursor<
  _Cursor extends TransactionCursor = TransactionCursor,
  _Units extends string = string,
  _FeeUnits extends string = _Units
> {
  transactions: AirGapTransaction<_Units, _FeeUnits>[]
  cursor: _Cursor
}

// ##### TransactionDetails #####

export interface TransactionDetails<_Units extends string = string> {
  to: Address
  amount: Amount<_Units>
  arbitraryData?: string
}

export interface TransactionConfiguration<_FeeUnits extends string = string> {
  fee?: Amount<_FeeUnits>
  arbitraryData?: string
  keepMinBalance?: boolean
  assetId?: number // TODO: move it to an extension?
}

// ##### TransactionStatus #####

interface BaseTransactionStatus<_Type extends string> extends Sealed<_Type> {
  hash?: string
  block?: string
}

interface AppliedTransactionStatus extends BaseTransactionStatus<'applied'> {}
interface FailedTransactionStatus extends BaseTransactionStatus<'failed'> {}
interface UnknownTransactionStatus extends BaseTransactionStatus<'unknown'> {}
interface CustomTransactionStatus extends BaseTransactionStatus<'custom'> {
  name: string
}

export type AirGapTransactionStatus =
  | AppliedTransactionStatus
  | FailedTransactionStatus
  | UnknownTransactionStatus
  | CustomTransactionStatus
