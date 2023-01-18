import { AirGapTransactionStatus } from '../../../types/transaction'
import { _OnlineProtocol } from '../../protocol'

export type TransactionStatusCheckerExtension<_T extends _OnlineProtocol> = TransactionStatusChecker
export interface TransactionStatusChecker {
  getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>>
}
