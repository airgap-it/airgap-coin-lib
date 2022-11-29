import { MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapOnlineExtendedProtocol, AirGapOnlineProtocol, Balance, isOnlineExtendedProtocol, newAmount } from '@airgap/module-kit'

import { AirGapOnlineWallet } from './AirGapOnlineWallet'

export enum TimeInterval {
  HOURS = '24h',
  DAYS = '7d',
  MONTH = '30d'
}

export class AirGapCoinWallet<
  T extends AirGapOnlineProtocol | AirGapOnlineExtendedProtocol = AirGapOnlineProtocol | AirGapOnlineExtendedProtocol
> extends AirGapOnlineWallet<T> {
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
    const networkType = (await this.protocol.getNetwork()).type
    this.currentMarketPrice = networkType === 'mainnet' ? marketPrice : new BigNumber(0)
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
    const protocolMetadata = await this.protocol.getMetadata()
    const protocolIdentifier = protocolMetadata.identifier

    let balance: Balance<string>
    if (
      (protocolIdentifier === MainProtocolSymbols.BTC ||
        protocolIdentifier === MainProtocolSymbols.BTC_SEGWIT ||
        protocolIdentifier === MainProtocolSymbols.GRS) &&
      this.publicKey.type === 'xpub' &&
      isOnlineExtendedProtocol(this.protocol)
    ) {
      // TODO: Remove and test
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      balance = await this.protocol.getBalanceOfPublicKey(this.publicKey)
    } else if (
      this.addresses.length > 0 &&
      protocolIdentifier !== MainProtocolSymbols.XTZ_SHIELDED /* TODO: cover ALL sapling protocols */
    ) {
      balance = await this.protocol.getBalanceOfAddresses(this.addressesToCheck())
    } else if (this.publicKey.type === 'xpub') {
      if (!isOnlineExtendedProtocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      balance = await this.protocol.getBalanceOfPublicKey(this.publicKey)
    } else {
      balance = await this.protocol.getBalanceOfPublicKey(this.publicKey)
    }

    const result: BigNumber = new BigNumber(newAmount(balance.total).blockchain(protocolMetadata.units).value)

    this.setCurrentBalance(result)

    return result
  }
}
