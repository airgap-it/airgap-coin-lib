import { IAirGapTransaction } from './IAirGapTransaction'
import BigNumber from 'bignumber.js'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

export interface IAirGapWallet {
  addresses: string[]
  coinProtocol: ICoinProtocol

  deriveAddresses(amount: number): string[]
  balanceOf(): Promise<BigNumber>
  fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]>
  prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber): Promise<IAirGapTransaction>
}
