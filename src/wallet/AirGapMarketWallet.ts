import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionStatus, IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { FeeDefaults, ICoinProtocol } from '../protocols/ICoinProtocol'
import { NetworkType } from '../utils/ProtocolNetwork'
import { MainProtocolSymbols } from '../utils/ProtocolSymbols'

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
  volumefrom: string
  volumeto: number
}

export interface AirGapWalletPriceService {
  getCurrentMarketPrice(protocol: ICoinProtocol, baseSymbol: string): Promise<BigNumber>
  getMarketPricesOverTime(
    protocol: ICoinProtocol,
    timeUnit: TimeUnit,
    numberOfMinutes: number,
    date: Date,
    baseSymbol: string
  ): Promise<MarketDataSample[]>
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export class AirGapMarketWallet extends AirGapWallet {
  public currentBalance: BigNumber | undefined
  public _currentMarketPrice: BigNumber | undefined
  public _marketPriceOverTime: MarketDataSample[] | undefined

  get currentMarketPrice(): BigNumber | undefined {
    return this._currentMarketPrice
  }

  set currentMarketPrice(marketPrice: BigNumber | undefined) {
    this._currentMarketPrice = this.protocol.options.network.type === NetworkType.MAINNET ? marketPrice : new BigNumber(0)
  }

  get marketPriceOverTime(): MarketDataSample[] | undefined {
    return this._marketPriceOverTime
  }

  set marketPriceOverTime(marketPrices: MarketDataSample[] | undefined) {
    this._marketPriceOverTime =
      this.protocol.options.network.type === NetworkType.MAINNET
        ? marketPrices
        : marketPrices?.map(() => ({
          time: 0,
          close: 0,
          high: 0,
          low: 0,
          volumefrom: '0',
          volumeto: 0
        }))
  }

  constructor(
    public protocol: ICoinProtocol,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public priceService: AirGapWalletPriceService,
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

  public async setProtocol(protocol: ICoinProtocol): Promise<void> {
    await super.setProtocol(protocol)
    this.currentBalance = undefined
    this.currentMarketPrice = undefined
    await this.synchronize()
  }

  public async fetchCurrentMarketPrice(baseSymbol = 'USD'): Promise<BigNumber> {
    this.currentMarketPrice = await this.priceService.getCurrentMarketPrice(this.protocol, baseSymbol)

    return this.currentMarketPrice
  }

  public async getMarketPricesOverTime(timeUnit: TimeUnit, numberOfMinutes: number, date: Date, baseSymbol: string = 'USD') {
    this.marketPriceOverTime = await this.priceService.getMarketPricesOverTime(this.protocol, timeUnit, numberOfMinutes, date, baseSymbol)

    return this.marketPriceOverTime
  }

  private addressesToCheck(): string[] {
    const addressesToReceive: string[] = this.addressIndex !== undefined ? [this.addresses[this.addressIndex]] : this.addresses

    return addressesToReceive
  }
  public async balanceOf(): Promise<BigNumber> {
    if (this.protocol.identifier === MainProtocolSymbols.GRS && this.isExtendedPublicKey) {
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
    if (this.protocol.identifier === MainProtocolSymbols.GRS && this.isExtendedPublicKey) {
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
    if (
      this.protocol.identifier.toLowerCase() === MainProtocolSymbols.ETH ||
      this.protocol.identifier.toLowerCase() === MainProtocolSymbols.XTZ
    ) {
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
}
