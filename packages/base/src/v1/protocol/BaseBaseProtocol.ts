import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { EthereumBaseProtocolImpl, EthereumUnits, EthereumUtils } from '@airgap/ethereum/v1'
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
  newAmount,
  newSignedTransaction,
  newUnsignedTransaction,
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

import { BaseInfoClient } from '../client/info/BaseInfoClient'
import { BaseNodeClient } from '../client/node/BaseNodeClient'
import { BaseCryptoConfiguration } from '../types/crypto'
import { BaseProtocolNetwork, BaseProtocolOptions } from '../types/protocol'
import { BaseRawUnsignedTransaction, BaseSignedTransaction, BaseTransactionCursor, BaseUnsignedTransaction } from '../types/transaction'

// Interface

export interface BaseBaseProtocol<_Units extends string = EthereumUnits> extends AirGapProtocol<
  {
    AddressResult: Address
    ProtocolNetwork: BaseProtocolNetwork
    CryptoConfiguration: BaseCryptoConfiguration
    Units: _Units
    FeeUnits: EthereumUnits
    FeeEstimation: FeeDefaults<EthereumUnits>
    SignedTransaction: BaseSignedTransaction
    UnsignedTransaction: BaseUnsignedTransaction
    TransactionCursor: BaseTransactionCursor
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

export abstract class BaseBaseProtocolImpl<
  _Units extends string = EthereumUnits,
  _EthereumProtocol extends EthereumBaseProtocolImpl<_Units, BaseProtocolNetwork> = EthereumBaseProtocolImpl<_Units, BaseProtocolNetwork>,
  _Options extends BaseProtocolOptions = BaseProtocolOptions
> implements BaseBaseProtocol<_Units> {
  protected constructor(
    protected readonly ethereumProtocol: _EthereumProtocol,
    protected readonly nodeClient: BaseNodeClient,
    protected readonly infoClient: BaseInfoClient,
    protected readonly options: _Options
  ) {
    this.units = this.ethereumProtocol.units
    this.feeUnits = this.ethereumProtocol.feeUnits
  }

  // Common

  protected readonly units: ProtocolUnitsMetadata<_Units>
  protected readonly feeUnits: ProtocolUnitsMetadata<EthereumUnits>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, EthereumUnits>> {
    return this.ethereumProtocol.getMetadata()
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
    transaction: BaseUnsignedTransaction | BaseSignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    const ethereumDetails: AirGapTransaction<_Units, EthereumUnits>[] = await this.ethereumProtocol.getDetailsFromTransaction(
      transaction,
      publicKey
    )

    const l1DataFee =
      transaction.type === 'signed' ? transaction.l1DataFee : transaction.ethereumType === 'raw' ? transaction.l1DataFee : undefined

    if (l1DataFee === undefined) {
      return ethereumDetails
    }

    const l1DataFeePerTransaction = new BigNumber(l1DataFee).div(ethereumDetails.length)

    return ethereumDetails.map((details) => {
      const feeBlockchain = newAmount(details.fee).blockchain(this.feeUnits)

      return {
        ...details,
        fee: newAmount(l1DataFeePerTransaction.plus(feeBlockchain.value), 'blockchain')
      }
    })
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

  public async getCryptoConfiguration(): Promise<BaseCryptoConfiguration> {
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
    transaction: BaseUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BaseSignedTransaction> {
    const ethereumTransaction = await this.ethereumProtocol.signTransactionWithSecretKey(transaction, secretKey)

    return transaction.ethereumType === 'raw'
      ? newSignedTransaction<BaseSignedTransaction>({
          ...ethereumTransaction,
          l1DataFee: transaction.l1DataFee
        })
      : ethereumTransaction
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

  public async getNetwork(): Promise<BaseProtocolNetwork> {
    return this.ethereumProtocol.getNetwork()
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: BaseTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BaseTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForPublicKey(publicKey, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: BaseTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BaseTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: BaseTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BaseTransactionCursor, _Units, EthereumUnits>> {
    return this.ethereumProtocol.getTransactionsForAddresses(addresses, limit, cursor)
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
    const [metadata, ethereumMaxAmount]: [ProtocolMetadata<_Units, EthereumUnits>, Amount<_Units>] = await Promise.all([
      this.getMetadata(),
      this.ethereumProtocol.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
    ])

    const maxAmountBlockchain: BigNumber = new BigNumber(newAmount(ethereumMaxAmount).blockchain(metadata.units).value)
    const maxAmountPerRecipient: BigNumber = maxAmountBlockchain.div(to.length)

    const ethereumTransaction = await this.ethereumProtocol.prepareTransactionWithPublicKey(
      publicKey,
      to.map((recipient: string) => ({
        to: recipient,
        amount: newAmount(maxAmountPerRecipient, 'blockchain')
      })),
      configuration
    )
    const l1Fee = await this.nodeClient.getL1Fee(this.options.network.gasPriceOracleAddress, ethereumTransaction)

    if (maxAmountBlockchain.lte(l1Fee)) {
      return newAmount(0, 'blockchain')
    }

    return newAmount(maxAmountBlockchain.minus(l1Fee), 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[]
  ): Promise<FeeDefaults<EthereumUnits>> {
    const l2Fee: FeeDefaults<EthereumUnits> = await this.ethereumProtocol.getTransactionFeeWithPublicKey(publicKey, details)

    const ethereumTransaction = await this.ethereumProtocol.prepareTransactionWithPublicKey(publicKey, details, { fee: l2Fee.medium })
    const l1Fee = await this.nodeClient.getL1Fee(this.options.network.gasPriceOracleAddress, ethereumTransaction)

    return {
      low: newAmount(l1Fee.plus(newAmount(l2Fee.low).blockchain(this.feeUnits).value), 'blockchain'),
      medium: newAmount(l1Fee.plus(newAmount(l2Fee.medium).blockchain(this.feeUnits).value), 'blockchain'),
      high: newAmount(l1Fee.plus(newAmount(l2Fee.high).blockchain(this.feeUnits).value), 'blockchain')
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<EthereumUnits>
  ): Promise<BaseUnsignedTransaction> {
    const ethereumTransaction = await this.ethereumProtocol.prepareTransactionWithPublicKey(publicKey, details, configuration)

    if (ethereumTransaction.ethereumType === 'typed') {
      return ethereumTransaction
    }

    const l1Gas = await this.nodeClient.getL1Fee(this.options.network.gasPriceOracleAddress, ethereumTransaction)

    const gasLimit: BigNumber = EthereumUtils.hexToNumber(ethereumTransaction.gasLimit)
    const gasPrice: BigNumber = EthereumUtils.hexToNumber(ethereumTransaction.gasPrice)

    const totalGas: BigNumber = gasPrice.times(gasLimit)
    const l2Gas: BigNumber = totalGas.minus(l1Gas).abs()
    const newGasPrice: BigNumber = l2Gas.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)

    return newUnsignedTransaction<BaseRawUnsignedTransaction>({
      ...ethereumTransaction,
      gasPrice: EthereumUtils.toHex(newGasPrice.toFixed()),
      l1DataFee: l1Gas.toFixed()
    })
  }

  public async getWalletConnectChain(): Promise<string> {
    return this.ethereumProtocol.getWalletConnectChain()
  }

  public async prepareWalletConnectTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    request: WalletConnectRequest
  ): Promise<BaseUnsignedTransaction> {
    const ethereumTransaction = await this.ethereumProtocol.prepareWalletConnectTransactionWithPublicKey(publicKey, request)

    if (ethereumTransaction.ethereumType === 'typed') {
      return ethereumTransaction
    }

    const l1Gas = await this.nodeClient.getL1Fee(this.options.network.gasPriceOracleAddress, ethereumTransaction)

    return newUnsignedTransaction<BaseRawUnsignedTransaction>({
      ...ethereumTransaction,
      l1DataFee: l1Gas.toFixed()
    })
  }

  public async broadcastTransaction(transaction: BaseSignedTransaction): Promise<string> {
    return this.ethereumProtocol.broadcastTransaction(transaction)
  }
}
