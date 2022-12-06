import { MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  AirGapOnlineProtocol,
  AirGapTransactionsWithCursor,
  Amount,
  Bip32OverridingExtension,
  ExtendedPublicKey,
  FeeEstimation,
  hasMultiAddressAccounts,
  isBip32Protocol,
  protocolNetworkIdentifier,
  PublicKey,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '@airgap/module-kit'

import { AirGapWallet, AirGapWalletStatus, SerializedAirGapWallet } from '../AirGapWallet'

// TODO: we'll have to migrate serialized legacy wallets
export interface SerializedAirGapOnlineWallet extends SerializedAirGapWallet {
  networkIdentifier: string
}

export interface AirGapWalletPriceService {
  getCurrentMarketPrice(protocol: AirGapOnlineProtocol, baseSymbol: string): Promise<BigNumber>
}

export abstract class AirGapOnlineWallet<
  T extends AirGapOnlineProtocol | Bip32OverridingExtension<AirGapOnlineProtocol> =
    | AirGapOnlineProtocol
    | Bip32OverridingExtension<AirGapOnlineProtocol>
> extends AirGapWallet<AirGapOnlineProtocol, T> {
  private synchronizePromise?: Promise<void>

  public constructor(
    protocol: T,
    publicKey: T extends Bip32OverridingExtension<AirGapOnlineProtocol>
      ? PublicKey | ExtendedPublicKey
      : T extends AirGapOnlineProtocol
      ? PublicKey
      : never,
    derivationPath: string,
    masterFingerprint: string,
    status: AirGapWalletStatus,
    public readonly priceService: AirGapWalletPriceService,
    addressIndex?: number
  ) {
    super(protocol, publicKey, derivationPath, masterFingerprint, status, addressIndex)
  }

  public abstract getCurrentBalance(...args: any): BigNumber | undefined
  public abstract setCurrentBalance(balance: BigNumber | undefined, ...args: any): void

  public abstract getCurrentMarketPrice(...args: any): BigNumber | undefined
  public abstract setCurrentMarketPrice(balance: BigNumber | undefined, ...args: any): void

  public abstract fetchCurrentMarketPrice(...args: any): Promise<BigNumber>
  public abstract balanceOf(...args: any): Promise<BigNumber>

  protected abstract _synchronize(...args: any): Promise<void>
  protected abstract reset(): void

  protected addressesToCheck(): string[] {
    const addressesToReceive: string[] = this.addressIndex !== undefined ? [this.addresses[this.addressIndex]] : this.addresses

    return addressesToReceive
  }

  public async setProtocol(protocol: T): Promise<void> {
    await super.setProtocol(protocol)
    this.reset()
    await this.synchronize()
  }

  public async synchronize(...args: any): Promise<void> {
    if (this.synchronizePromise === undefined) {
      this.synchronizePromise = this._synchronize(...args).finally(() => {
        this.synchronizePromise = undefined
      })
    }

    return this.synchronizePromise
  }

  public async fetchTransactions(limit: number, cursor?: TransactionCursor): Promise<AirGapTransactionsWithCursor> {
    const protocolIdentifier = (await this.protocol.getMetadata()).identifier

    let transactions: AirGapTransactionsWithCursor
    if (
      (protocolIdentifier === MainProtocolSymbols.BTC ||
        protocolIdentifier === MainProtocolSymbols.BTC_SEGWIT ||
        protocolIdentifier === MainProtocolSymbols.GRS) &&
      this.publicKey.type === 'xpub' &&
      isBip32Protocol(this.protocol)
    ) {
      // TODO: Remove and test
      /* 
      We should remove this if BTC also uses blockbook. (And change the order of the if/else below)
      
      The problem is that we have addresses cached for all protocols. But blockbook (grs) doesn't allow
      multiple addresses to be checked at once, so we need to xPub key there (or we would do 100s of requests).

      We can also not simply change the order of the following if/else, because then it would use the xPub method for
      BTC as well, which results in the addresses being derived again, which causes massive lags in the apps.
      */
      transactions = await this.protocol.getTransactionsForPublicKey(this.publicKey, limit, cursor)
    } else if (
      this.addresses.length > 0 &&
      protocolIdentifier !== MainProtocolSymbols.XTZ_SHIELDED /* TODO: cover ALL sapling protocols */
    ) {
      transactions = hasMultiAddressAccounts(this.protocol)
        ? await this.protocol.getTransactionsForAddresses(this.addressesToCheck(), limit, cursor)
        : await this.protocol.getTransactionsForAddress(this.addressesToCheck()[0], limit, cursor)
    } else if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      transactions = await this.protocol.getTransactionsForPublicKey(this.publicKey, limit, cursor)
    } else {
      transactions = await this.protocol.getTransactionsForPublicKey(this.publicKey, limit, cursor)
    }

    return transactions
  }

  public prepareTransaction(
    details: TransactionDetails[],
    fee?: Amount,
    data: { [key: string]: unknown } = {}
  ): Promise<UnsignedTransaction> {
    if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      return this.protocol.prepareTransactionWithPublicKey(this.publicKey, details, { fee })
    } else {
      if (this.addressIndex) {
        // TODO: what should we do with addressIndex?
        data = Object.assign(data, { addressIndex: this.addressIndex })
      }

      return this.protocol.prepareTransactionWithPublicKey(this.publicKey, details, { fee })
    }
  }

  public async getMaxTransferValue(recipients: string[], fee?: Amount, data: { [key: string]: unknown } = {}): Promise<Amount> {
    if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      return this.protocol.getTransactionMaxAmountWithPublicKey(this.publicKey, recipients, fee)
    } else {
      if (this.addressIndex) {
        // TODO: what should we do with addressIndex?
        data = Object.assign(data, { addressIndex: this.addressIndex })
      }

      return this.protocol.getTransactionMaxAmountWithPublicKey(this.publicKey, recipients, fee)
    }
  }

  public async estimateFees(details: TransactionDetails[], data: { [key: string]: unknown } = {}): Promise<FeeEstimation> {
    if (this.publicKey.type === 'xpub') {
      if (!isBip32Protocol(this.protocol)) {
        // This *should* never happen because of how the constructor is typed, but the compiler doesn't know it.
        // TODO: check if there's a way to tell the compiler here that `publicKey: ExtendedPublicKey => protocol: AirGapOnlineExtendedProtocol`
        throw this.xpubRequiresExtendedProtocolError()
      }

      return this.protocol.getTransactionFeeWithPublicKey(this.publicKey, details)
    } else {
      if (this.addressIndex) {
        // TODO: what should we do with addressIndex?
        data = Object.assign(data, { addressIndex: this.addressIndex })
      }

      return this.protocol.getTransactionFeeWithPublicKey(this.publicKey, details)
    }
  }

  public async toJSON(): Promise<SerializedAirGapOnlineWallet> {
    const [base, networkIdentifier] = await Promise.all([
      super.toJSON(),
      this.protocol.getNetwork().then((network) => protocolNetworkIdentifier(network))
    ])

    return {
      ...base,
      networkIdentifier
    }
  }
}
