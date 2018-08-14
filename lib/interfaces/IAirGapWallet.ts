import { ICoinProtocol, IAirGapTransaction } from '..'
import BigNumber from 'bignumber.js'

export interface IAirGapWallet {
  addresses: string[]
  coinProtocol: ICoinProtocol

  deriveAddresses(amount: number): string[]
  balanceOf(): Promise<BigNumber>
  fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]>
  prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber): Promise<IAirGapTransaction>
}
