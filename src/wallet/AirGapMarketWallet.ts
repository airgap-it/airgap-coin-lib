import Axios from '../dependencies/src/axios-0.19.0/index'

import { IAirGapTransaction } from '..'
import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as cryptocompare from '../dependencies/src/cryptocompare-0.5.0/index'

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

export class AirGapMarketWallet extends AirGapWallet {
  public currentBalance: BigNumber | undefined
  public currentMarketPrice: BigNumber | undefined

  public marketSample: MarketDataSample[] = []
  public minuteMarketSample: MarketDataSample[] = []
  public dailyMarketSample: MarketDataSample[] = []
  public hourlyMarketSample: MarketDataSample[] = []

  constructor(
    public protocolIdentifier: string,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public addressIndex?: number
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
        .catch(cryptocompareError => {
          // TODO: Remove once cryptocompare supports xchf
          const symbolMapping = {
            xchf: 'cryptofranc'
          }

          console.error('cryptocompare', cryptocompareError)

          const id = symbolMapping[this.coinProtocol.marketSymbol.toLowerCase()]
          if (id) {
            Axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
              .then(({ data }) => {
                this.currentMarketPrice = new BigNumber(data[id].usd)
                resolve(this.currentMarketPrice)
              })
              .catch(coinGeckoError => {
                console.error(coinGeckoError)
              })
          }
        })
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
        const price = this.currentMarketPrice
        this.balanceOf()
          .then(balance => {
            resolve(new BigNumber(balance.toNumber() * price.toNumber()))
          })
          .catch(reject)
      } else {
        this.fetchCurrentMarketPrice()
          .then(price => {
            this.balanceOf()
              .then(balance => {
                resolve(new BigNumber(balance.toNumber() * price.toNumber()))
              })
              .catch(reject)
          })
          .catch(reject)
      }
    })
  }

  private addressesToCheck(): string[] {
    const addressesToReceive = this.addressIndex !== undefined ? [this.addresses[this.addressIndex]] : this.addresses
    return addressesToReceive
  }
  public async balanceOf(): Promise<BigNumber> {
    if (this.protocolIdentifier === 'grs' && this.isExtendedPublicKey) {
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      return this.coinProtocol.getBalanceOfExtendedPublicKey(this.publicKey, 0)
    } else if (this.addresses.length > 0) {
      return this.coinProtocol.getBalanceOfAddresses(this.addressesToCheck())
    } else if (this.isExtendedPublicKey) {
      return this.coinProtocol.getBalanceOfExtendedPublicKey(this.publicKey, 0)
    } else {
      return this.coinProtocol.getBalanceOfPublicKey(this.publicKey)
    }
  }

  public fetchTransactions(limit: number, offset: number): Promise<IAirGapTransaction[]> {
    if (this.protocolIdentifier === 'grs' && this.isExtendedPublicKey) {
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      return this.coinProtocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, offset)
    } else if (this.addresses.length > 0) {
      return this.coinProtocol.getTransactionsFromAddresses(this.addressesToCheck(), limit, offset)
    } else if (this.isExtendedPublicKey) {
      return this.coinProtocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, offset)
    } else {
      return this.coinProtocol.getTransactionsFromPublicKey(this.publicKey, limit, offset)
    }
  }

  public prepareTransaction(recipients: string[], values: BigNumber[], fee: BigNumber, data?: any): Promise<IAirGapTransaction> {
    if (this.isExtendedPublicKey) {
      return this.coinProtocol.prepareTransactionFromExtendedPublicKey(this.publicKey, 0, recipients, values, fee, data)
    } else {
      if (this.addressIndex) {
        data = { addressIndex: this.addressIndex }
      }
      return this.coinProtocol.prepareTransactionFromPublicKey(this.publicKey, recipients, values, fee, data)
    }
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
