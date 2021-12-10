import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosSaplingProtocol } from '../protocols/tezos/sapling/TezosSaplingProtocol'
import { NetworkType } from '../utils/ProtocolNetwork'
import { MainProtocolSymbols } from '../utils/ProtocolSymbols'

import { AirGapMarketWallet } from './AirGapMarketWallet'

export enum TimeInterval {
  HOURS = '24h',
  DAYS = '7d',
  MONTH = '30d'
}

export class AirGapCoinWallet extends AirGapMarketWallet {
  private currentBalance: BigNumber | undefined

  public getCurrentBalance(): BigNumber | undefined {
    return this.currentBalance
  }

  public setCurrentBalance(balance: BigNumber | undefined): void {
    this.currentBalance = balance
  }

  public currentMarketPrice: BigNumber | undefined

  public getCurrentMarketPrice(): BigNumber | undefined {
    return this.currentMarketPrice
  }

  public setCurrentMarketPrice(marketPrice: BigNumber | undefined): void {
    this.currentMarketPrice = this.protocol.options.network.type === NetworkType.MAINNET ? marketPrice : new BigNumber(0)
  }

  protected async _synchronize(): Promise<void> {
    const [balance, marketPrice] = await Promise.all([this.balanceOf(), this.fetchCurrentMarketPrice()])
    this.setCurrentBalance(balance)
    this.setCurrentMarketPrice(marketPrice)
  }

  protected reset(): void {
    this.currentBalance = undefined
    this.currentMarketPrice = undefined
  }

  public async fetchCurrentMarketPrice(baseSymbol = 'USD'): Promise<BigNumber> {
    const marketPrice = await this.priceService.getCurrentMarketPrice(this.protocol, baseSymbol)
    this.setCurrentMarketPrice(marketPrice)

    return marketPrice
  }

  public async balanceOf(): Promise<BigNumber> {
    if (
      (this.protocol.identifier === MainProtocolSymbols.BTC ||
        this.protocol.identifier === MainProtocolSymbols.BTC_SEGWIT ||
        this.protocol.identifier === MainProtocolSymbols.GRS) &&
      this.isExtendedPublicKey
    ) {
      // TODO: Remove and test
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      return new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else if (this.protocol instanceof TezosSaplingProtocol) {
      return new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey))
    } else if (this.addresses.length > 0) {
      return new BigNumber(await this.protocol.getBalanceOfAddresses(this.addressesToCheck()))
    } else if (this.isExtendedPublicKey) {
      return new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else {
      return new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey))
    }
  }
}
