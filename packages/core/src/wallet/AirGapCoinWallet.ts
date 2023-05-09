import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
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

  public async setCurrentMarketPrice(marketPrice: BigNumber | undefined): Promise<void> {
    this.currentMarketPrice = (await this.protocol.getOptions()).network.type === NetworkType.MAINNET ? marketPrice : new BigNumber(0)
  }

  protected async _synchronize(): Promise<void> {
    const [balance, marketPrice] = await Promise.all([this.balanceOf(), this.fetchCurrentMarketPrice()])
    this.setCurrentBalance(balance)
    await this.setCurrentMarketPrice(marketPrice)
  }

  protected reset(): void {
    this.currentBalance = undefined
    this.currentMarketPrice = undefined
  }

  public async fetchCurrentMarketPrice(baseSymbol = 'USD'): Promise<BigNumber> {
    const marketPrice = await this.priceService.getCurrentMarketPrice(this.protocol, baseSymbol)
    await this.setCurrentMarketPrice(marketPrice)

    return marketPrice
  }

  public async balanceOf(): Promise<BigNumber> {
    const protocolIdentifier = await this.protocol.getIdentifier()

    let result: BigNumber
    if (
      (protocolIdentifier === MainProtocolSymbols.BTC ||
        protocolIdentifier === MainProtocolSymbols.BTC_SEGWIT ||
        protocolIdentifier === MainProtocolSymbols.GRS) &&
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
      result = new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else if (
      protocolIdentifier === MainProtocolSymbols.XTZ_SHIELDED /* TODO: cover ALL sapling protocols */ ||
      protocolIdentifier === MainProtocolSymbols.ICP
    ) {
      result = new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey))
    } else if (this.addresses.length > 0) {
      result = new BigNumber(await this.protocol.getBalanceOfAddresses(this.addressesToCheck()))
    } else if (this.isExtendedPublicKey) {
      result = new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0))
    } else {
      result = new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey))
    }
    this.setCurrentBalance(result)
    return result
  }
}
