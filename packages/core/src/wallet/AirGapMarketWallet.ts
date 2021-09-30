import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction, IAirGapTransactionResult, IProtocolTransactionCursor } from '../interfaces/IAirGapTransaction'
import { FeeDefaults, ICoinProtocol } from '../protocols/ICoinProtocol'
import { TezosSaplingProtocol } from '../protocols/tezos/sapling/TezosSaplingProtocol'
import { TezosSaplingTransactionCursor } from '../protocols/tezos/types/sapling/TezosSaplingTransactionCursor'
import { NetworkType } from '../utils/ProtocolNetwork'
import { MainProtocolSymbols } from '../utils/ProtocolSymbols'

import { AirGapWallet, AirGapWalletStatus } from './AirGapWallet'

export enum TimeInterval {
  HOURS = '24h',
  DAYS = '7d',
  MONTH = '30d'
}

export interface AirGapWalletPriceService {
  getCurrentMarketPrice(protocol: ICoinProtocol, baseSymbol: string): Promise<BigNumber>
}

export class AirGapMarketWallet extends AirGapWallet {
  public currentBalance: BigNumber | undefined
  public _currentMarketPrice: BigNumber | undefined

  private synchronizePromise?: Promise<void>

  get currentMarketPrice(): BigNumber | undefined {
    return this._currentMarketPrice
  }

  set currentMarketPrice(marketPrice: BigNumber | undefined) {
    this._currentMarketPrice = this.protocol.options.network.type === NetworkType.MAINNET ? marketPrice : new BigNumber(0)
  }

  constructor(
    public protocol: ICoinProtocol,
    public publicKey: string,
    public isExtendedPublicKey: boolean,
    public derivationPath: string,
    public masterFingerprint: string,
    public status: AirGapWalletStatus,
    public priceService: AirGapWalletPriceService,
    public addressIndex?: number
  ) {
    super(protocol, publicKey, isExtendedPublicKey, derivationPath, masterFingerprint, status, addressIndex)
  }

  public async synchronize(): Promise<void> {
    if (this.synchronizePromise === undefined) {
      this.synchronizePromise = new Promise((resolve, reject) => {
        Promise.all([this.balanceOf(), this.fetchCurrentMarketPrice()])
          .then((results) => {
            this.currentBalance = results[0]
            this.currentMarketPrice = results[1]
            this.synchronizePromise = undefined
            resolve()
          })
          .catch((error) => {
            this.synchronizePromise = undefined
            reject(error)
          })
      })
    }

    return this.synchronizePromise
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

  private addressesToCheck(): string[] {
    const addressesToReceive: string[] = this.addressIndex !== undefined ? [this.addresses[this.addressIndex]] : this.addresses

    return addressesToReceive
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

  public async fetchTransactions(limit: number, cursor?: IProtocolTransactionCursor): Promise<IAirGapTransactionResult> {
    // let transactions: IAirGapTransaction[] = []
    let transactionResult: IAirGapTransactionResult
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
      transactionResult = await this.protocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, cursor)
    } else if (this.protocol instanceof TezosSaplingProtocol) {
      transactionResult = await this.protocol.getTransactionsFromPublicKey(this.publicKey, limit, cursor as TezosSaplingTransactionCursor)
    } else if (this.addresses.length > 0) {
      transactionResult = await this.protocol.getTransactionsFromAddresses(this.addressesToCheck(), limit, cursor)
    } else if (this.isExtendedPublicKey) {
      transactionResult = await this.protocol.getTransactionsFromExtendedPublicKey(this.publicKey, limit, cursor)
    } else {
      transactionResult = await this.protocol.getTransactionsFromPublicKey(this.publicKey, limit, cursor)
    }

    return transactionResult
  }

  public async getMaxTransferValue(recipients: string[], fee?: string, excludeExistentialDeposit?: boolean): Promise<BigNumber> {
    if (this.isExtendedPublicKey) {
      return new BigNumber(await this.protocol.estimateMaxTransactionValueFromExtendedPublicKey(this.publicKey, recipients, fee))
    } else {
      return new BigNumber(
        await this.protocol.estimateMaxTransactionValueFromPublicKey(
          this.publicKey,
          recipients,
          fee,
          this.addressIndex,
          excludeExistentialDeposit
        )
      )
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
