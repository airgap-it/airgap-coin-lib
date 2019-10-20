import { BigNumber } from 'bignumber.js'

import { IAirGapTransaction } from '..'
import { MarketDataSample } from '../wallet/AirGapMarketWallet'

export interface IAirGapMarketWallet {
  fetchCurrentMarketPrice(baseSymbol: string): Promise<BigNumber>
  fetchDailyMarketPrices(numberOfDays: number, date: Date, baseSymbol: string): Promise<MarketDataSample[]>
  fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol: string): Promise<MarketDataSample[]>
  fetchMinutesMarketPrices(numberOfMinutes: number, date: Date, baseSymbol: string): Promise<MarketDataSample[]>
  fetchTransactionValue(): Promise<BigNumber>
  balanceOf(): Promise<BigNumber>
  fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]>
  prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber): Promise<IAirGapTransaction>
}
