import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import { NetworkType } from '../utils/ProtocolNetwork'

import { AirGapMarketWallet } from './AirGapMarketWallet'

export class AirGapNFTWallet extends AirGapMarketWallet {
  private currentBalance: Record<string, BigNumber | undefined> = {}

  public getCurrentBalance(assetID: string): BigNumber | undefined {
    return this.currentBalance[assetID]
  }

  public setCurrentBalance(balance: BigNumber | undefined, assetID: string): void {
    this.currentBalance[assetID] = balance
  }

  private currentMarketPrice: Record<string, BigNumber | undefined> = {}

  public getCurrentMarketPrice(assetID: string): BigNumber | undefined {
    return this.currentMarketPrice[assetID]
  }

  public setCurrentMarketPrice(marketPrice: BigNumber | undefined, assetID: string): void {
    this.getCurrentMarketPrice[assetID] = this.protocol.options.network.type === NetworkType.MAINNET ? marketPrice : new BigNumber(0)
  }

  public async synchronize(assetsID: string[] = []): Promise<void> {
    return super.synchronize(assetsID)
  }

  protected async _synchronize(assetIDs: string[] = []): Promise<void> {
    await Promise.all(
      assetIDs.map(async (assetID) => {
        const [balance, marketPrice] = await Promise.all([this.balanceOf(assetID), this.fetchCurrentMarketPrice(assetID)])

        this.setCurrentBalance(balance, assetID)
        this.setCurrentMarketPrice(marketPrice, assetID)
      })
    )
  }

  protected reset(): void {
    this.currentBalance = {}
    this.currentMarketPrice = {}
  }

  public async fetchCurrentMarketPrice(_assetID: string, _baseSymbol: string = 'USD'): Promise<BigNumber> {
    // TODO
    return new BigNumber(0)
  }

  public async balanceOf(assetID: string): Promise<BigNumber> {
    if (this.isExtendedPublicKey) {
      return new BigNumber(await this.protocol.getBalanceOfExtendedPublicKey(this.publicKey, 0, { assetID }))
    } else {
      return new BigNumber(await this.protocol.getBalanceOfPublicKey(this.publicKey, { addressIndex: this.addressIndex, assetID }))
    }
  }
}
