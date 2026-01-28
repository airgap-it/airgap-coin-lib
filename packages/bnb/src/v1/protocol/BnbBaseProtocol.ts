import { EthereumBaseProtocolImpl, EthereumUnits } from '@airgap/ethereum/v1'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeDefaults,
  KeyPair,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  WalletConnectRequest,
  TokenDetails
} from '@airgap/module-kit'

import { BnbInfoClient } from '../client/info/BnbinfoClient'
import { BnbNodeClient } from '../client/node/BnbNodeClient'
import { BnbCryptoConfiguration } from '../types/crypto'
import { BnbProtocolNetwork, BnbProtocolOptions, BnbUnits } from '../types/protocol'
import { BnbSignedTransaction, BnbTransactionCursor, BnbUnsignedTransaction } from '../types/transaction'

// BNB Units Metadata
export const DEFAULT_BNB_UNITS_METADATA: ProtocolUnitsMetadata<BnbUnits> = {
  BNB: {
    symbol: { value: 'BNB', market: 'bnb' },
    decimals: 18
  },
  GWEI: {
    symbol: { value: 'GWEI' },
    decimals: 9
  },
  JAGER: {
    symbol: { value: 'JAGER' },
    decimals: 0
  }
}

// Interface

export interface BnbBaseProtocol<_Units extends string = BnbUnits> extends AirGapProtocol<
  {
    AddressResult: Address
    ProtocolNetwork: BnbProtocolNetwork
    CryptoConfiguration: BnbCryptoConfiguration
    Units: _Units
    FeeUnits: EthereumUnits
    FeeEstimation: FeeDefaults<EthereumUnits>
    SignedTransaction: BnbSignedTransaction
    UnsignedTransaction: BnbUnsignedTransaction
    TransactionCursor: BnbTransactionCursor
  },
  'Bip32',
  'Crypto',
  'FetchDataForAddress',
  'FetchDataForMultipleAddresses',
  'GetTokenBalances',
  'TransactionStatusChecker',
  'WalletConnect'
> {}

// Implementation

export abstract class BnbBaseProtocolImpl<
  _Units extends string = BnbUnits,
  _EthereumProtocol extends EthereumBaseProtocolImpl<_Units, BnbProtocolNetwork> = EthereumBaseProtocolImpl<_Units, BnbProtocolNetwork>,
  _Options extends BnbProtocolOptions = BnbProtocolOptions
> implements BnbBaseProtocol<_Units> {
  protected constructor(
    protected readonly ethereumProtocol: _EthereumProtocol,
    protected readonly nodeClient: BnbNodeClient,
    protected readonly infoClient: BnbInfoClient,
    protected readonly options: _Options
  ) {
    this.units = this.ethereumProtocol.units
    this.feeUnits = this.ethereumProtocol.feeUnits
  }

  // Common

  protected readonly units: ProtocolUnitsMetadata<_Units>
  protected readonly feeUnits: ProtocolUnitsMetadata<EthereumUnits>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, EthereumUnits>> {
    const metadata = await this.ethereumProtocol.getMetadata()

    // Override fee display to show BNB instead of ETH
    return {
      ...metadata,
      fee: {
        ...metadata.fee,
        mainUnit: 'ETH', // Keep as ETH for internal compatibility, but override units display
        units: {
          ETH: {
            symbol: { value: 'BNB', market: 'bnb' },
            decimals: 18
          },
          GWEI: {
            symbol: { value: 'GWEI' },
            decimals: 9
          },
          WEI: {
            symbol: { value: 'JAGER' },
            decimals: 0
          }
        }
      }
    }
  }

  public async getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.ethereumProtocol.getAddressFromPublicKey(publicKey)
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    return this.ethereumProtocol.deriveFromExtendedPublicKey(extendedPublicKey, visibilityIndex, addressIndex)
  }

  public async getDetailsFromTransaction(
    transaction: BnbUnsignedTransaction | BnbSignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    return this.ethereumProtocol.getDetailsFromTransaction(transaction, publicKey)
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    return this.ethereumProtocol.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.ethereumProtocol.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  // Offline

  public async getCryptoConfiguration(): Promise<BnbCryptoConfiguration> {
    return this.ethereumProtocol.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.ethereumProtocol.getKeyPairFromDerivative(derivative)
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    return this.ethereumProtocol.getExtendedKeyPairFromDerivative(derivative)
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    return this.ethereumProtocol.deriveFromExtendedSecretKey(extendedSecretKey, visibilityIndex, addressIndex)
  }

  public async signTransactionWithSecretKey(
    transaction: BnbUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BnbSignedTransaction> {
    return this.ethereumProtocol.signTransactionWithSecretKey(transaction, secretKey)
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    return this.ethereumProtocol.signMessageWithKeyPair(message, keyPair)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    return this.ethereumProtocol.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.ethereumProtocol.encryptAESWithSecretKey(payload, secretKey)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.ethereumProtocol.decryptAESWithSecretKey(payload, secretKey)
  }

  // Online

  public async getNetwork(): Promise<BnbProtocolNetwork> {
    return this.ethereumProtocol.getNetwork()
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: BnbTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForPublicKey(publicKey, limit, cursor) as Promise<
      AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>
    >
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: BnbTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForAddress(address, limit, cursor) as Promise<
      AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>
    >
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: BnbTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForAddresses(addresses, limit, cursor) as Promise<
      AirGapTransactionsWithCursor<BnbTransactionCursor, _Units, EthereumUnits>
    >
  }

  public async getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>> {
    return this.ethereumProtocol.getTransactionStatus(transactionIds)
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<_Units>> {
    return this.ethereumProtocol.getBalanceOfPublicKey(publicKey)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<_Units>> {
    return this.ethereumProtocol.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<_Units>> {
    return this.ethereumProtocol.getBalanceOfAddresses(addresses)
  }

  public async getTokenBalancesOfPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    tokens: TokenDetails[]
  ): Promise<Record<string, Amount>> {
    return this.ethereumProtocol.getTokenBalancesOfPublicKey(publicKey, tokens)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<EthereumUnits>
  ): Promise<Amount<_Units>> {
    return this.ethereumProtocol.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[]
  ): Promise<FeeDefaults<EthereumUnits>> {
    return this.ethereumProtocol.getTransactionFeeWithPublicKey(publicKey, details)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<EthereumUnits>
  ): Promise<BnbUnsignedTransaction> {
    return this.ethereumProtocol.prepareTransactionWithPublicKey(publicKey, details, configuration)
  }

  public async getWalletConnectChain(): Promise<string> {
    return this.ethereumProtocol.getWalletConnectChain()
  }

  public async prepareWalletConnectTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    request: WalletConnectRequest
  ): Promise<BnbUnsignedTransaction> {
    return this.ethereumProtocol.prepareWalletConnectTransactionWithPublicKey(publicKey, request)
  }

  public async broadcastTransaction(transaction: BnbSignedTransaction): Promise<string> {
    return this.ethereumProtocol.broadcastTransaction(transaction)
  }
}
