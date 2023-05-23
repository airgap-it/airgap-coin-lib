import { BitcoinProtocol, BitcoinTransactionCursor, BitcoinUnits } from '@airgap/bitcoin/v1'
import { BitcoinProtocolImpl } from '@airgap/bitcoin/v1/protocol/BitcoinProtocol'
import { MainProtocolSymbols } from '@airgap/coinlib-core'
// @ts-ignore
import * as bitGoUTXO from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
// @ts-ignore
import * as groestlcoinJSMessage from '@airgap/coinlib-core/dependencies/src/groestlcoinjs-message-2.1.0/index'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeDefaults,
  KeyPair,
  newAmount,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { GroestlcoinCryptoConfiguration } from '../types/crypto'
import {
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolOptions,
  GroestlcoinStandardProtocolNetwork,
  GroestlcoinUnits
} from '../types/protocol'
import { GroestlcoinSignedTransaction, GroestlcoinTransactionCursor, GroestlcoinUnsignedTransaction } from '../types/transaction'

// Interface

export interface GroestlcoinProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: GroestlcoinProtocolNetwork
      CryptoConfiguration: GroestlcoinCryptoConfiguration
      SignedTransaction: GroestlcoinSignedTransaction
      TransactionCursor: GroestlcoinTransactionCursor
      Units: GroestlcoinUnits
      FeeEstimation: FeeDefaults<GroestlcoinUnits>
      UnsignedTransaction: GroestlcoinUnsignedTransaction
    },
    'Bip32',
    'Crypto',
    'FetchDataForAddress',
    'FetchDataForMultipleAddresses'
  > {}

// Implementation

const BITCOINJS_MAINNET_NETWORK: string = 'groestlcoin'

export class GroestlcoinProtocolImpl implements GroestlcoinProtocol {
  private readonly options: GroestlcoinProtocolOptions
  private readonly bitcoinProtocol: BitcoinProtocol

  constructor(options: RecursivePartial<GroestlcoinProtocolOptions>) {
    this.options = createGroestlcoinProtocolOptions(options.network)
    this.bitcoinProtocol = new BitcoinProtocolImpl(
      {
        ...this.options,
        network: {
          ...this.options.network,
          type: 'custom',
          bitcoinjsNetworkName: BITCOINJS_MAINNET_NETWORK
        }
      },
      bitGoUTXO,
      groestlcoinJSMessage
    )
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<GroestlcoinUnits> = {
    GRS: {
      symbol: { value: 'GRS', market: 'grs' },
      decimals: 8
    },
    mGRS: {
      symbol: { value: 'mGRS' },
      decimals: 4
    },
    Satoshi: {
      symbol: { value: 'Satoshi' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<GroestlcoinUnits> = {
    low: newAmount(0.00002, 'GRS').blockchain(this.units),
    medium: newAmount(0.00004, 'GRS').blockchain(this.units),
    high: newAmount(0.00005, 'GRS').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<GroestlcoinUnits> = {
    identifier: MainProtocolSymbols.GRS,
    name: 'Groestlcoin',

    units: this.units,
    mainUnit: 'GRS',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/17'/0'`,
      address: {
        isCaseSensitive: true,
        placeholder: 'Fdb...',
        regex: '^([F3][a-km-zA-HJ-NP-Z1-9]{33}|grs1[a-zA-HJ-NP-Z0-9]{39})$'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<GroestlcoinUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.bitcoinProtocol.getAddressFromPublicKey(publicKey)
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    return this.bitcoinProtocol.deriveFromExtendedPublicKey(extendedPublicKey, visibilityIndex, addressIndex)
  }

  public async getDetailsFromTransaction(
    transaction: GroestlcoinSignedTransaction | GroestlcoinUnsignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<GroestlcoinUnits>[]> {
    const bitcoinTransactions: AirGapTransaction<BitcoinUnits>[] = await this.bitcoinProtocol.getDetailsFromTransaction(
      transaction,
      publicKey
    )

    return Promise.all(
      bitcoinTransactions.map((transaction: AirGapTransaction<BitcoinUnits>) => this.fromBitcoinAirGapTransaction(transaction))
    )
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    return this.bitcoinProtocol.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.bitcoinProtocol.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  // Offline

  public async getCryptoConfiguration(): Promise<GroestlcoinCryptoConfiguration> {
    return this.bitcoinProtocol.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.bitcoinProtocol.getKeyPairFromDerivative(derivative)
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    return this.bitcoinProtocol.getExtendedKeyPairFromDerivative(derivative)
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    return this.bitcoinProtocol.deriveFromExtendedSecretKey(extendedSecretKey, visibilityIndex, addressIndex)
  }

  public async signTransactionWithSecretKey(
    transaction: GroestlcoinUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<GroestlcoinSignedTransaction> {
    return this.bitcoinProtocol.signTransactionWithSecretKey(transaction, secretKey)
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    return this.bitcoinProtocol.signMessageWithKeyPair(message, keyPair)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    return this.bitcoinProtocol.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.bitcoinProtocol.encryptAESWithSecretKey(payload, secretKey)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.bitcoinProtocol.decryptAESWithSecretKey(payload, secretKey)
  }

  // Online

  public async getNetwork(): Promise<GroestlcoinProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: GroestlcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<GroestlcoinTransactionCursor, GroestlcoinUnits>> {
    const bitcoinTransactions: AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits> =
      await this.bitcoinProtocol.getTransactionsForPublicKey(publicKey, limit, cursor)

    return this.fromBitcoinAirGapTransactionWithCursor(bitcoinTransactions)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: GroestlcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<GroestlcoinTransactionCursor, GroestlcoinUnits>> {
    const bitcoinTransactions: AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits> =
      await this.bitcoinProtocol.getTransactionsForAddress(address, limit, cursor)

    return this.fromBitcoinAirGapTransactionWithCursor(bitcoinTransactions)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: GroestlcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<GroestlcoinTransactionCursor, GroestlcoinUnits>> {
    const bitcoinTransactions: AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits> =
      await this.bitcoinProtocol.getTransactionsForAddresses(addresses, limit, cursor)

    return this.fromBitcoinAirGapTransactionWithCursor(bitcoinTransactions)
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<GroestlcoinUnits>> {
    const bitcoinBalance: Balance<BitcoinUnits> = await this.bitcoinProtocol.getBalanceOfPublicKey(publicKey)

    return this.fromBitcoinBalance(bitcoinBalance)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<GroestlcoinUnits>> {
    const bitcoinBalance: Balance<BitcoinUnits> = await this.bitcoinProtocol.getBalanceOfAddress(address)

    return this.fromBitcoinBalance(bitcoinBalance)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<GroestlcoinUnits>> {
    const bitcoinBalance: Balance<BitcoinUnits> = await this.bitcoinProtocol.getBalanceOfAddresses(addresses)

    return this.fromBitcoinBalance(bitcoinBalance)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<GroestlcoinUnits>
  ): Promise<Amount<GroestlcoinUnits>> {
    const bitcoinFee: Amount<BitcoinUnits> | undefined = configuration?.fee ? this.toBitcoinAmount(configuration.fee) : undefined
    const bitcoinMax: Amount<BitcoinUnits> = await this.bitcoinProtocol.getTransactionMaxAmountWithPublicKey(publicKey, to, {
      ...configuration,
      fee: bitcoinFee
    })

    return this.fromBitcoinAmount(bitcoinMax)
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<GroestlcoinUnits>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<GroestlcoinUnits>> {
    const bitcoinDetails: TransactionDetails<BitcoinUnits>[] = details.map((details: TransactionDetails<GroestlcoinUnits>) =>
      this.toBitcoinTransactionDetails(details)
    )
    const bitcoinFeeEstimation: FeeDefaults<BitcoinUnits> = await this.bitcoinProtocol.getTransactionFeeWithPublicKey(
      publicKey,
      bitcoinDetails,
      configuration
    )

    return this.fromBitcoinFeeEstimation(bitcoinFeeEstimation)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<GroestlcoinUnits>[],
    configuration?: TransactionFullConfiguration<GroestlcoinUnits>
  ): Promise<GroestlcoinUnsignedTransaction> {
    const bitcoinDetails: TransactionDetails<BitcoinUnits>[] = details.map((details: TransactionDetails<GroestlcoinUnits>) =>
      this.toBitcoinTransactionDetails(details)
    )
    const bitcoinFee: Amount<BitcoinUnits> | undefined = configuration?.fee ? this.toBitcoinAmount(configuration.fee) : undefined

    return this.bitcoinProtocol.prepareTransactionWithPublicKey(publicKey, bitcoinDetails, {
      ...configuration,
      fee: bitcoinFee
    })
  }

  public async broadcastTransaction(transaction: GroestlcoinSignedTransaction): Promise<string> {
    return this.bitcoinProtocol.broadcastTransaction(transaction)
  }

  // Custom

  private async fromBitcoinAirGapTransaction(transaction: AirGapTransaction<BitcoinUnits>): Promise<AirGapTransaction<GroestlcoinUnits>> {
    const [amount, fee]: [Amount<GroestlcoinUnits>, Amount<GroestlcoinUnits>] = await Promise.all([
      this.fromBitcoinAmount(transaction.amount),
      this.fromBitcoinAmount(transaction.fee)
    ])

    return {
      ...transaction,
      amount,
      fee
    }
  }

  private async fromBitcoinAirGapTransactionWithCursor(
    transactionsWithCursor: AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>
  ): Promise<AirGapTransactionsWithCursor<GroestlcoinTransactionCursor, GroestlcoinUnits>> {
    return {
      transactions: await Promise.all(
        transactionsWithCursor.transactions.map((transaction: AirGapTransaction<BitcoinUnits>) =>
          this.fromBitcoinAirGapTransaction(transaction)
        )
      ),
      cursor: {
        hasNext: transactionsWithCursor.cursor.hasNext,
        page: transactionsWithCursor.cursor.page
      }
    }
  }

  private async fromBitcoinBalance(balance: Balance<BitcoinUnits>): Promise<Balance<GroestlcoinUnits>> {
    const [total, transferable]: [Amount<GroestlcoinUnits>, Amount<GroestlcoinUnits> | undefined] = await Promise.all([
      this.fromBitcoinAmount(balance.total),
      balance.transferable ? this.fromBitcoinAmount(balance.transferable) : Promise.resolve(undefined)
    ])

    return { total, transferable }
  }

  private async fromBitcoinFeeEstimation(feeEstimation: FeeDefaults<BitcoinUnits>): Promise<FeeDefaults<GroestlcoinUnits>> {
    const [low, medium, high]: [Amount<GroestlcoinUnits>, Amount<GroestlcoinUnits>, Amount<GroestlcoinUnits>] = await Promise.all([
      this.fromBitcoinAmount(feeEstimation.low),
      this.fromBitcoinAmount(feeEstimation.medium),
      this.fromBitcoinAmount(feeEstimation.high)
    ])

    return { low, medium, high }
  }

  private async fromBitcoinAmount(amount: Amount<BitcoinUnits>): Promise<Amount<GroestlcoinUnits>> {
    const bitcoinUnits = await this.getBitcoinUnits()

    return this.convertAmount(amount, bitcoinUnits)
  }

  private toBitcoinTransactionDetails(details: TransactionDetails<GroestlcoinUnits>): TransactionDetails<BitcoinUnits> {
    return {
      ...details,
      amount: this.toBitcoinAmount(details.amount)
    }
  }

  private toBitcoinAmount(amount: Amount<GroestlcoinUnits>): Amount<BitcoinUnits> {
    return this.convertAmount(amount, this.units)
  }

  private bitcoinUnits: ProtocolUnitsMetadata<BitcoinUnits> | undefined = undefined
  private async getBitcoinUnits(): Promise<ProtocolUnitsMetadata<BitcoinUnits>> {
    if (this.bitcoinUnits === undefined) {
      const metadata: ProtocolMetadata<BitcoinUnits> = await this.bitcoinProtocol.getMetadata()

      this.bitcoinUnits = metadata.units
    }

    return this.bitcoinUnits
  }

  private convertAmount<F extends string, T extends string>(amount: Amount<F>, fromUnits: ProtocolUnitsMetadata<F>): Amount<T> {
    return newAmount(newAmount(amount).blockchain(fromUnits).value, 'blockchain')
  }
}

// Factory

export function createGroestlcoinProtocol(options: RecursivePartial<GroestlcoinProtocolOptions> = {}): GroestlcoinProtocol {
  return new GroestlcoinProtocolImpl(options)
}

export const GROESTLCOIN_MAINNET_PROTOCOL_NETWORK: GroestlcoinStandardProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: '',
  blockExplorerUrl: 'https://chainz.cryptoid.info/grs',
  indexerApi: `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${'https://blockbook.groestlcoin.org'}`
}

export const GROESTLCOIN_TESTNET_PROTOCOL_NETWORK: GroestlcoinStandardProtocolNetwork = {
  name: 'Testnet',
  type: 'testnet',
  rpcUrl: '',
  blockExplorerUrl: 'https://chainz.cryptoid.info/grs-test',
  indexerApi: 'https://blockbook-test.groestlcoin.org/'
}

const DEFAULT_GROESTLCOIN_PROTOCOL_NETWORK: GroestlcoinStandardProtocolNetwork = GROESTLCOIN_MAINNET_PROTOCOL_NETWORK

export function createGroestlcoinProtocolOptions(network: Partial<GroestlcoinProtocolNetwork> = {}): GroestlcoinProtocolOptions {
  return {
    network:
      network.type === 'custom'
        ? { ...DEFAULT_GROESTLCOIN_PROTOCOL_NETWORK, bitcoinjsNetworkName: BITCOINJS_MAINNET_NETWORK, ...network }
        : ({ ...DEFAULT_GROESTLCOIN_PROTOCOL_NETWORK, ...network } as GroestlcoinStandardProtocolNetwork)
  }
}
