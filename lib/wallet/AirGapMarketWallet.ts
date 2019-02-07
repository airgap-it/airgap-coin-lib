import BigNumber from 'bignumber.js'
import { AirGapWallet } from './AirGapWallet'
import * as cryptocompare from 'cryptocompare'

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

export class AirGapMarketWallet extends AirGapWallet {
  public currentBalance: BigNumber
  public currentMarketPrice: BigNumber

  public marketSample: MarketDataSample[] = []
  public minuteMarketSample: MarketDataSample[] = []
  public dailyMarketSample: MarketDataSample[] = []
  public hourlyMarketSample: MarketDataSample[] = []

  constructor(
    public protocolIdentifier: string,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public addressIndex: number = 0
  ) {
    super(protocolIdentifier, publicKey, isExtendedPublicKey, derivationPath, addressIndex)
  }

  public synchronize(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all([this.balanceOf(), this.fetchCurrentMarketPrice()])
        .then(results => {
          this.currentBalance = results[0]
          this.currentMarketPrice = results[1]
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  public fetchCurrentMarketPrice(baseSymbol = 'USD'): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      cryptocompare
        .price(this.coinProtocol.marketSymbol.toUpperCase(), baseSymbol)
        .then(prices => {
          this.currentMarketPrice = new BigNumber(prices.USD)
          resolve(this.currentMarketPrice)
        })
        .catch(console.error)
    })
  }

  public fetchDailyMarketPrices(numberOfDays: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.dailyMarketSample = []
    return new Promise((resolve, reject) => {
      this.algoSelector(numberOfDays, TimeUnit.Days, date, baseSymbol)
        .then(marketSample => {
          this.dailyMarketSample = marketSample
          resolve(this.dailyMarketSample)
        })
        .catch()
    })
  }

  public fetchHourlyMarketPrices(numberOfHours: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.hourlyMarketSample = []
    return new Promise((resolve, reject) => {
      this.algoSelector(numberOfHours, TimeUnit.Hours, date, baseSymbol)
        .then(marketSample => {
          this.hourlyMarketSample = marketSample
          resolve(this.hourlyMarketSample)
        })
        .catch()
    })
  }

  public fetchMinutesMarketPrices(numberOfMinutes: number, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    this.minuteMarketSample = []
    return new Promise((resolve, reject) => {
      this.algoSelector(numberOfMinutes, TimeUnit.Minutes, date, baseSymbol)
        .then(marketSample => {
          this.minuteMarketSample = marketSample
          resolve(this.minuteMarketSample)
        })
        .catch()
    })
  }

  public fetchWalletValue(): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      if (this.currentMarketPrice) {
        this.balanceOf()
          .then(balance => {
            resolve(new BigNumber(balance.toNumber() * this.currentMarketPrice.toNumber()))
          })
          .catch(reject)
      } else {
        this.fetchCurrentMarketPrice()
          .then(() => {
            this.balanceOf()
              .then(balance => {
                resolve(new BigNumber(balance.toNumber() * this.currentMarketPrice.toNumber()))
              })
              .catch(reject)
          })
          .catch(reject)
      }
    })
  }

  private algoSelector(numberOfMinutes: number, timeUnit: TimeUnit, date: Date, baseSymbol = 'USD'): Promise<MarketDataSample[]> {
    return new Promise((resolve, reject) => {
      let promise: Promise<MarketDataSample>
      if (timeUnit === 'days') {
        promise = cryptocompare.histoDay(this.coinProtocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else if (timeUnit === 'hours') {
        promise = cryptocompare.histoHour(this.coinProtocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else if (timeUnit === 'minutes') {
        promise = cryptocompare.histoMinute(this.coinProtocol.marketSymbol.toUpperCase(), baseSymbol, {
          limit: numberOfMinutes - 1,
          timestamp: date
        })
      } else {
        promise = Promise.reject('Invalid time unit')
      }
      promise
        .then(prices => {
          for (let idx in prices) {
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
