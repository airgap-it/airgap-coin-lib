import { ICoinProtocol, IAirGapTransaction } from '..'
import BigNumber from 'bignumber.js'

export interface IOnLedgerUpdateListener {
  onNewTransactions(airGapTransactions: IAirGapTransaction[])
}
