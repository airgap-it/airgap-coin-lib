import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapOnlineProtocol, Balance, Bip32Extension, isBip32Protocol, newAmount } from '@airgap/module-kit'

import { AirGapOnlineWallet } from './AirGapOnlineWallet'

export class AirGapNFTWallet<
  T extends AirGapOnlineProtocol | Bip32Extension<AirGapOnlineProtocol> = AirGapOnlineProtocol | Bip32Extension<AirGapOnlineProtocol>
> extends AirGapOnlineWallet<T> {
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

  public async setCurrentMarketPrice(marketPrice: BigNumber | undefined, assetID: string): Promise<void> {
    const networkType = (await this.protocol.getNetwork()).type
    this.currentMarketPrice[assetID] = networkType === 'mainnet' ? marketPrice : new BigNumber(0)
  }

  public async synchronize(assetsID: string[] = []): Promise<void> {
    return super.synchronize(assetsID)
  }

  protected async _synchronize(assetIDs: string[] = []): Promise<void> {
    await Promise.all(
      assetIDs.map(async (assetID) => {
        const [balance, marketPrice] = await Promise.all([this.balanceOf(assetID), this.fetchCurrentMarketPrice(assetID)])

        this.setCurrentBalance(balance, assetID)
        await this.setCurrentMarketPrice(marketPrice, assetID)
      })
    )
  }

  protected reset(): void {
    this.currentBalance = {}
    this.currentMarketPrice = {}
  }

  public async fetchCurrentMarketPrice(assetID: string, _baseSymbol: string = 'USD'): Promise<BigNumber> {
    // TODO
    const result = new BigNumber(0)
    await this.setCurrentMarketPrice(result, assetID)
    return result
  }

  public async balanceOf(assetID: string): Promise<BigNumber> {
    const protocolMetadata = await this.protocol.getMetadata()

    let balance: Balance<string>
    if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      // TODO: handle assetID
      balance = await this.protocol.getBalanceOfPublicKey(this.publicKey /* { assetID } */)
    } else {
      balance = await this.protocol.getBalanceOfPublicKey(this.publicKey /* { addressIndex: this.addressIndex, assetID } */)
    }

    const result = new BigNumber(newAmount(balance.total).blockchain(protocolMetadata.units).value)

    this.setCurrentBalance(result, assetID)

    return result
  }
}
