import { AirGapTransactionStatus } from '../../../types/transaction'
import { OnlineProtocol } from '../../protocol'

export type TransactionStatusCheckerExtension<T extends OnlineProtocol> = TransactionStatusChecker
export interface TransactionStatusChecker {
  getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>>
}
