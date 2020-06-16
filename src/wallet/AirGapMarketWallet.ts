import { IAirGapTransaction } from '..'
import Axios from '../dependencies/src/axios-0.19.0/index'
import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as cryptocompare from '../dependencies/src/cryptocompare-0.5.0/index'
import { AirGapTransactionStatus } from '../interfaces/IAirGapTransaction'
import { FeeDefaults, ICoinProtocol } from '../protocols/ICoinProtocol'

import { AirGapWallet } from './AirGapWallet'

export enum TimeUnit {
  Hours = 'hours',
  Days = 'days',
  Minutes = 'minutes'
}

export interface MarketDataSample {
  time: number
  close: number
  high: number
  low: number
  open: number
  volumefrom: string
  volumeto: number
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export class AirGapMarketWallet extends AirGapWallet {
  public currentBalance: BigNumber | undefined
  public currentMarketPrice: BigNumber | undefined

  public marketSample: MarketDataSample[] = []
  public minuteMarketSample: MarketDataSample[] = []
  public dailyMarketSample: MarketDataSample[] = []
  public hourlyMarketSample: MarketDataSample[] = []

  constructor(
    public protocol: ICoinProtocol,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public addressIndex?: number
  ) {
    super(protocol, publicKey, isExtendedPublicKey, derivationPath, addressIndex)
  }

  public synchronize(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all([this.balanceOf(), this.fetchCurrentMarketPrice()])
        .then((results) => {
          this.currentBalance = results[0]
          this.currentMarketPrice = results[1]
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  public fetchCurrentMarketPrice(baseSymbol = 'USD'): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      cryptocompare
        .price(this.protocol.marketSymbol.toUpperCase(), baseSymbol)
        .then((prices) => {
          this.currentMarketPrice = new BigNumber(prices.USD)
          resolve(this.currentMarketPrice)
        })
        .catch((cryptocompareError) => {
          // TODO: Remove once cryptocompare supports xchf
          const symbolMapping = {
            xchf: 'cryptofranc'
          }

          console.error('cryptocompare', cryptocompareError)

          const id = symbolMapping[this.protocol.marketSymbol.toLowerCase()]
          if (id) {
            Axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
              .then(({ data }) => {
                this.currentMarketPrice = new BigNumber(data[id].usd)
                resolve(this.currentMarketPrice)
              })
              .catch((coinGeckoError) => {
                console.error(coinGeckoError)
              })
          }
        })
    })
  }

  public fetchDailyMarketPrices(numberOfDays: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.dailyMarketSample = []

    return new Promise((resolve) => {
      this.algoSelector(numberOfDays, TimeUnit.Days, date, baseSymbol)
        .then((marketSample) => {
          this.dailyMarketSample = marketSample
          resolve(this.dailyMarketSample)
        })
        .catch()
    })
  }

  public fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.hourlyMarketSample = []

    return new Promise((resolve) => {
      this.algoSelector(numberOfHours, TimeUnit.Hours, date, baseSymbol)
        .then((marketSample) => {
          this.hourlyMarketSample = marketSample
          resolve(this.hourlyMarketSample)
        })
        .catch()
    })
  }

  public fetchMinutesMarketPrices(numberOfMinutes: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.minuteMarketSample = []

    return new Promise((resolve) => {
      this.algoSelector(numberOfMinutes, TimeUnit.Minutes, date, baseSymbol)
        .then((marketSample) => {
          this.minuteMarketSample = marketSample
          resolve(this.minuteMarketSample)
        })
        .catch()
    })
  }

  public fetchWalletValue(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      if (this.currentMarketPrice) {
        const price = this.currentMarketPrice
        this.balanceOf()
          .then((balance) => {
            resolve(new BigNumber(balance.toNumber() * price.toNumber()))
          })
          .catch(reject)
      } else {
        this.fetchCurrentMarketPrice()
          .then((price) => {
            this.balanceOf()
              .then((balance) => {
                resolve(new BigNumber(balance.toNumber() * price.toNumber()))
              })
              .catch(reject)
          })
          .catch(reject)
      }
    })
  }

  private addressesToCheck(): string[] {
    const addressesToReceive: string[] = this.addressIndex !== undefined ? [this.addresses[this.addressIndex]] : this.addresses

    return addressesToReceive
  }
  public async balanceOf(): Promise<BigNumber> {
    if (this.protocol.identifier === 'grs' && this.isExtendedPublicKey) {
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      return new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else if (this.addresses.length > 0) {
      return new BigNumber(await this.protocol.getBalanceOfAddresses(this.addressesToCheck()))
    } else if (this.isExtendedPublicKey) {
      return new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else {
      return new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey))
    }
  }

  public async fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]> {
    let transactions: IAirGapTransaction[] = []
    if (this.protocol.identifier === 'grs' && this.isExtendedPublicKey) {
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      transactions = await this.protocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, offset)
    } else if (this.addresses.length > 0) {
      transactions = await this.protocol.getTransactionsFromAddresses(this.addressesToCheck(), limit, offset)
    } else if (this.isExtendedPublicKey) {
      transactions = await this.protocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, offset)
    } else {
      transactions = await this.protocol.getTransactionsFromPublicKey(this.publicKey, limit, offset)
    }

    return this.txsIncludingStatus(transactions)
  }

  private async txsIncludingStatus(transactions: IAirGapTransaction[]): Promise<IAirGapTransaction[]> {
    if (this.protocol.identifier.toLowerCase() === 'eth' || this.protocol.identifier.toLowerCase() === 'xtz') {
      const transactionsWithHash: IAirGapTransaction[] = transactions.filter((tx: IAirGapTransaction) => tx.hash)
      const hashes: string[] = transactionsWithHash.map((tx: IAirGapTransaction) => tx.hash).filter(notEmpty) // Extra filter here for typing reasons, should not alter the array because we filter on the line before.

      if (transactionsWithHash.length !== hashes.length) {
        throw new Error('Transaction array lengths do not match!')
      }

      const statuses: AirGapTransactionStatus[] = await this.protocol.getTransactionStatuses(hashes)

      transactionsWithHash.forEach((el: IAirGapTransaction, i: number) => {
        el.status = statuses[i]
      })
    }

    return transactions
  }

  public async getMaxTransferValue(recipients: string[], fee?: string): Promise<BigNumber> {
    if (this.isExtendedPublicKey) {
      return new BigNumber(await this.protocol.estimateMaxTransactionValueFromExtendedPublicKey(this.publicKey, recipients, fee))
    } else {
      return new BigNumber(await this.protocol.estimateMaxTransactionValueFromPublicKey(this.publicKey, recipients, fee))
    }
  }

  public prepareTransaction(recipients: string[], values: string[], fee: string, data?: unknown): Promise<IAirGapTransaction> {
    if (this.isExtendedPublicKey) {
      return this.protocol.prepareTransactionFromExtendedPublicKey(this.publicKey, 0, recipients, values, fee, data)
    } else {
      if (this.addressIndex) {
        data = { addressIndex: this.addressIndex }
      }

      return this.protocol.prepareTransactionFromPublicKey(this.publicKey, recipients, values, fee, data)
    }
  }

  public async estimateFees(recipients: string[], values: string[], data?: unknown): Promise<FeeDefaults> {
    if (this.isExtendedPublicKey) {
      return this.protocol.estimateFeeDefaultsFromExtendedPublicKey(this.publicKey, recipients, values, data)
    } else {
      if (this.addressIndex) {
        data = { addressIndex: this.addressIndex }
      }

      return this.protocol.estimateFeeDefaultsFromPublicKey(this.publicKey, recipients, values, data)
    }
  }

  private algoSelector(numberOfMinutes: number, timeUnit: TimeUnit, date: Date, baseSymbol: string = 'USD'): Promise<MarketDataSample[]> {
    return new Promise((resolve) => {
      let promise: Promise<MarketDataSample>
      if (timeUnit === 'days') {
        promise = cryptocompare.histoDay(this.protocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else if (timeUnit === 'hours') {
        promise = cryptocompare.histoHour(this.protocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else if (timeUnit === 'minutes') {
        promise = cryptocompare.histoMinute(this.protocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else {
        promise = Promise.reject('Invalid time unit')
      }
      promise
        .then((prices) => {
          for (const idx in prices) {
            const marketDataObject = {
              time: prices[idx].time,
              close: prices[idx].close,
              high: prices[idx].high,
              low: prices[idx].low,
              volumefrom: prices[idx].volumefrom,
              volumeto: prices[idx].volumeto
            } as MarketDataSample
            this.marketSample.push(marketDataObject)
          }
          resolve(this.marketSample)
        })
        .catch(console.error)
    })
  }
}
