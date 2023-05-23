// tslint:disable: max-classes-per-file
import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
// @ts-ignore
import * as BitGo from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { encodeDerivative } from '@airgap/crypto'
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
  isAmount,
  KeyPair,
  newAmount,
  newExtendedPublicKey,
  newExtendedSecretKey,
  newPlainUIText,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  newWarningUIAlert,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import Common from '@ethereumjs/common'
// TODO: ETH TX and ethereumjs-util-5.2.0 removed
import { FeeMarketEIP1559Transaction, Transaction, TransactionFactory, TxData, TypedTransaction } from '@ethereumjs/tx'

import { EthereumCryptoClient } from '../clients/crypto/EthereumCryptoClient'
import { EthereumInfoClient, EthereumInfoClientTransactionsResult } from '../clients/info/EthereumInfoClient'
import { EthereumNodeClient } from '../clients/node/EthereumNodeClient'
import { EthereumAddress } from '../data/EthereumAddress'
import { EthereumCryptoConfiguration } from '../types/crypto'
import { EthereumBaseProtocolOptions, EthereumProtocolNetwork, EthereumProtocolOptions, EthereumUnits } from '../types/protocol'
import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumTypedUnsignedTransaction,
  EthereumUnsignedTransaction
} from '../types/transaction'
import { EthereumUtils } from '../utils/EthereumUtils'
import { convertExtendedPublicKey, convertExtendedSecretKey, convertPublicKey, convertSecretKey } from '../utils/key'

import { ETHEREUM_CHAIN_IDS } from './EthereumChainIds'

// Interface

export interface EthereumBaseProtocol<_Units extends string = EthereumUnits>
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: EthereumProtocolNetwork
      CryptoConfiguration: EthereumCryptoConfiguration
      Units: _Units
      FeeUnits: EthereumUnits
      FeeEstimation: FeeDefaults<EthereumUnits>
      SignedTransaction: EthereumSignedTransaction
      UnsignedTransaction: EthereumUnsignedTransaction
      TransactionCursor: EthereumTransactionCursor
    },
    'Bip32',
    'Crypto',
    'FetchDataForAddress',
    'FetchDataForMultipleAddresses',
    'TransactionStatusChecker'
  > {}

// Implementation

export const DEFAULT_ETHEREUM_UNITS_METADATA: ProtocolUnitsMetadata<EthereumUnits> = {
  ETH: {
    symbol: { value: 'ETH', market: 'eth' },
    decimals: 18
  },
  GWEI: {
    symbol: { value: 'GWEI' },
    decimals: 9
  },
  WEI: {
    symbol: { value: 'WEI' },
    decimals: 0
  }
}

const MAX_GAS_ESTIMATE: number = 300000

export abstract class EthereumBaseProtocolImpl<_Units extends string = EthereumUnits> implements EthereumBaseProtocol<_Units> {
  protected readonly options: EthereumProtocolOptions

  protected readonly nodeClient: EthereumNodeClient
  protected readonly infoClient: EthereumInfoClient
  protected readonly cryptoClient: EthereumCryptoClient

  protected readonly bitcoinJS: {
    lib: any
    config: {
      network: any
    }
  } = {
    lib: BitGo,
    config: { network: BitGo.networks.bitcoin }
  }

  protected constructor(nodeClient: EthereumNodeClient, infoClient: EthereumInfoClient, options: EthereumBaseProtocolOptions<_Units>) {
    this.options = options

    this.nodeClient = nodeClient
    this.infoClient = infoClient
    this.cryptoClient = new EthereumCryptoClient()

    this.units = options.units

    this.feeDefaults = options.feeDefaults ?? {
      low: newAmount(0.00021 /* 21000 GAS * 10 GWEI */, 'ETH').blockchain(this.feeUnits),
      medium: newAmount(0.000315 /* 21000 GAS * 15 GWEI */, 'ETH').blockchain(this.feeUnits),
      high: newAmount(0.00084 /* 21000 GAS * 40 GWEI */, 'ETH').blockchain(this.feeUnits)
    }

    this.metadata = {
      identifier: options.identifier,
      name: options.name,

      units: options.units,
      mainUnit: options.mainUnit,

      fee: {
        defaults: this.feeDefaults,
        units: this.feeUnits,
        mainUnit: 'ETH'
      },

      account: {
        standardDerivationPath: options.standardDerivationPath ?? `m/44'/60'/0'`,
        address: {
          isCaseSensitive: false,
          placeholder: '0xabc...',
          regex: '^0x[a-fA-F0-9]{40}$'
        }
      },

      transaction: {
        arbitraryData: {
          inner: { name: 'data' }
        }
      }
    }
  }

  // Common

  protected readonly units: ProtocolUnitsMetadata<_Units>
  protected readonly feeUnits: ProtocolUnitsMetadata<EthereumUnits> = DEFAULT_ETHEREUM_UNITS_METADATA
  protected readonly feeDefaults: FeeDefaults<EthereumUnits>

  protected readonly metadata: ProtocolMetadata<_Units, EthereumUnits>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, EthereumUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return EthereumAddress.from(this.nonExtendedPublicKey(publicKey)).asString()
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    return this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, visibilityIndex, addressIndex)
  }

  public async getDetailsFromTransaction(
    transaction: EthereumSignedTransaction | EthereumUnsignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    return publicKey.type === 'pub'
      ? this.getDetailsFromTransactionWithPublicKey(transaction, publicKey)
      : this.getDetailsFromTransactionWithExtendedPublicKey(transaction, publicKey)
  }

  private async getDetailsFromTransactionWithPublicKey(
    transaction: EthereumSignedTransaction | EthereumUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction)
      case 'unsigned':
        const ownAddress: string = await this.getAddressFromPublicKey(publicKey)
        if (transaction.ethereumType === 'typed') {
          return this.getDetailsFromTypedUnsignedTransaction(transaction, ownAddress)
        } else {
          return this.getDetailsFromRawUnsignedTransaction(transaction, ownAddress)
        }
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromTransactionWithExtendedPublicKey(
    transaction: EthereumSignedTransaction | EthereumUnsignedTransaction,
    extendedPublicKey: ExtendedPublicKey
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction)
      case 'unsigned':
        if (transaction.ethereumType === 'typed') {
          const dps: string[] = transaction.derivationPath.split('/')
          const derivedPublicKey: PublicKey = this.getPublicKeyFromExtendedPublicKey(
            extendedPublicKey,
            Number(dps[dps.length - 2]),
            Number(dps[dps.length - 1])
          )
          const ownAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)

          return this.getDetailsFromTypedUnsignedTransaction(transaction, ownAddress)
        } else {
          const derivedPublicKey: PublicKey = this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, 0, 0)
          const ownAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)

          return this.getDetailsFromRawUnsignedTransaction(transaction, ownAddress)
        }
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported transaction type.')
    }
  }

  protected async getDetailsFromSignedTransaction(
    transaction: EthereumSignedTransaction
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    const ethTx = TransactionFactory.fromSerializedData(Buffer.from(transaction.serialized, 'hex'))

    if (ethTx.type === 0) {
      const tx = ethTx as Transaction

      const hexValue = tx.value.toString('hex') || '0x0'
      const hexGasPrice = tx.gasPrice.toString('hex') || '0x0'
      const hexGasLimit = tx.gasLimit.toString('hex') || '0x0'
      const hexNonce = tx.nonce.toString('hex') || '0x0'
      const chainId = tx.common.chainIdBN().toString(10)
      const to = tx.to

      if (!to) {
        throw new Error('No "TO" address')
      }

      return [
        {
          from: [tx.getSenderAddress().toString()],
          to: [to.toString()],
          isInbound: tx.toCreationAddress(),

          amount: newAmount(parseInt(hexValue, 16), 'blockchain'),
          fee: newAmount(new BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(parseInt(hexGasPrice, 16)), 'blockchain'),

          network: this.options.network,
          status: {
            type: 'unknown',
            hash: `0x${tx.hash().toString('hex')}`
          },
          arbitraryData: `0x${tx.data.toString('hex')}`,
          extra: {
            chainId,
            nonce: parseInt(hexNonce, 16)
          }
        }
      ]
    }

    try {
      const feeTx = ethTx as FeeMarketEIP1559Transaction

      return [
        {
          from: [feeTx.getSenderAddress().toString()],
          to: [feeTx.to?.toString() ?? ''],
          isInbound: false,

          amount: newAmount(feeTx.value.toString(10), 'blockchain'),
          fee: newAmount(new BigNumber(feeTx.gasLimit.toString(10)).multipliedBy(feeTx.maxFeePerGas.toString(10)), 'blockchain'),

          network: this.options.network,
          arbitraryData: feeTx.data.toString('hex'),
          extra: {
            chainId: feeTx.chainId.toNumber(),
            nonce: feeTx.nonce.toNumber()
          }
        }
      ]
    } catch (e) {
      throw new Error(`Transaction type "${ethTx.type}" not supported`)
    }
  }

  protected async getDetailsFromTypedUnsignedTransaction(
    transaction: EthereumTypedUnsignedTransaction,
    ownAddress: string
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    const typedTransaction: FeeMarketEIP1559Transaction = TransactionFactory.fromSerializedData(
      Buffer.from(transaction.serialized, 'hex')
    ) as FeeMarketEIP1559Transaction
    const airGapTransaction: AirGapTransaction<_Units, EthereumUnits> = {
      from: [ownAddress],
      to: [typedTransaction.to?.toString() ?? ''],
      isInbound: false,

      amount: newAmount(typedTransaction.value.toString(10), 'blockchain'),
      fee: newAmount(
        new BigNumber(typedTransaction.gasLimit.toString(10)).multipliedBy(typedTransaction.maxFeePerGas.toString(10)),
        'blockchain'
      ),

      network: this.options.network,
      arbitraryData: typedTransaction.data.toString('hex'),

      uiAlerts:
        typedTransaction.chainId.toNumber() !== 1
          ? [
              newWarningUIAlert({
                title: newPlainUIText('Chain ID'),
                description: newPlainUIText(
                  `Please note that this is not an Ethereum Mainnet transaction, it is from ${
                    ETHEREUM_CHAIN_IDS[typedTransaction.chainId.toNumber()] ?? `Chain ID ${typedTransaction.chainId.toNumber()}`
                  }`
                )
              })
            ]
          : undefined
    }

    return [airGapTransaction]
  }

  protected async getDetailsFromRawUnsignedTransaction(
    transaction: EthereumRawUnsignedTransaction,
    ownAddress: string
  ): Promise<AirGapTransaction<_Units, EthereumUnits>[]> {
    return [
      {
        from: [ownAddress],
        to: [transaction.to],
        isInbound: false,

        amount: newAmount(transaction.value, 'blockchain'),
        fee: newAmount(new BigNumber(transaction.gasLimit).multipliedBy(transaction.gasPrice), 'blockchain'),

        network: this.options.network,
        arbitraryData: transaction.data
      }
    ]
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    const hexSignature: Signature = signature
    const hexPublicKey: PublicKey = convertPublicKey(this.nonExtendedPublicKey(publicKey), 'hex')

    return this.cryptoClient.verifyMessage(message, hexSignature.value, hexPublicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(this.nonExtendedPublicKey(publicKey), 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  // Offline

  private readonly cryptoConfiguration: EthereumCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public async getCryptoConfiguration(): Promise<EthereumCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const node = this.derivativeToBip32Node(derivative)

    return {
      secretKey: newSecretKey(node.keyPair.getPrivateKeyBuffer().toString('hex'), 'hex'),
      publicKey: newPublicKey(node.neutered().keyPair.getPublicKeyBuffer().toString('hex'), 'hex')
    }
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    const node = this.derivativeToBip32Node(derivative)

    return {
      secretKey: newExtendedSecretKey(node.toBase58(), 'encoded'),
      publicKey: newExtendedPublicKey(node.neutered().toBase58(), 'encoded')
    }
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    return this.getSecretKeyFromExtendedSecretKey(extendedSecretKey, visibilityIndex, addressIndex)
  }

  public async signTransactionWithSecretKey(
    transaction: EthereumUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<EthereumSignedTransaction> {
    return transaction.ethereumType === 'typed'
      ? this.signTypedUnsignedTransactionWithSecretKey(transaction, this.nonExtendedSecretKey(secretKey))
      : this.signRawUnsignedTransactionWithSecretKey(transaction, this.nonExtendedSecretKey(secretKey))
  }

  private async signTypedUnsignedTransactionWithSecretKey(
    transaction: EthereumTypedUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<EthereumSignedTransaction> {
    const typedTransaction: TypedTransaction = TransactionFactory.fromSerializedData(Buffer.from(transaction.serialized, 'hex'))

    return this.signTypedTransactionWithSecretKey(typedTransaction, secretKey)
  }

  private async signRawUnsignedTransactionWithSecretKey(
    transaction: EthereumRawUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<EthereumSignedTransaction> {
    const txData: TxData = {
      nonce: transaction.nonce,
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
      to: transaction.to,
      value: transaction.value.startsWith('0x') ? transaction.value : EthereumUtils.toHex(parseInt(transaction.value, 10)),
      data: transaction.data
    }

    let common: Common | undefined
    try {
      common = new Common({ chain: transaction.chainId })
    } catch {
      common = Common.custom({ chainId: transaction.chainId })
    }

    const typedTransaction: TypedTransaction = TransactionFactory.fromTxData(txData, { common })

    return this.signTypedTransactionWithSecretKey(typedTransaction, secretKey)
  }

  private async signTypedTransactionWithSecretKey(transaction: TypedTransaction, secretKey: SecretKey): Promise<EthereumSignedTransaction> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const signedTransaction = transaction.sign(Buffer.from(hexSecretKey.value, 'hex'))

    return newSignedTransaction<EthereumSignedTransaction>({
      serialized: signedTransaction.serialize().toString('hex')
    })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey = convertSecretKey(this.nonExtendedSecretKey(keyPair.secretKey), 'hex')
    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'hex')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(this.nonExtendedSecretKey(keyPair.secretKey), 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(this.nonExtendedPublicKey(keyPair.publicKey), 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, { privateKey: hexSecretKey.value, publicKey: hexPublicKey.value })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(this.nonExtendedSecretKey(secretKey), 'hex')

    return this.cryptoClient.encryptAES(payload, hexSecretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(this.nonExtendedSecretKey(secretKey), 'hex')

    return this.cryptoClient.decryptAES(payload, hexSecretKey.value)
  }

  // Online

  public async getNetwork(): Promise<EthereumProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, _Units, EthereumUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, _Units, EthereumUnits>> {
    return this.getTransactionsForAddresses([address], limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, _Units, EthereumUnits>> {
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<EthereumInfoClientTransactionsResult>[] = []
      for (const address of addresses) {
        promises.push(this.infoClient.fetchTransactions(address, limit, cursor))
      }

      Promise.all(promises)
        .then((values) => {
          const page = Math.max(...values.map((txResult) => txResult.cursor.page))
          const transactions: AirGapTransaction<_Units, EthereumUnits>[] = values.reduce((acc, current) => {
            return acc.concat(
              current.transactions.map((tx) => ({
                ...tx,
                amount: newAmount<_Units>(tx.amount.value, 'blockchain'),
                fee: newAmount<EthereumUnits>(tx.fee.value, 'blockchain'),
                network: this.options.network
              }))
            )
          }, [] as AirGapTransaction<_Units, EthereumUnits>[])

          const hasNext: boolean = transactions.length >= limit

          overallResolve({
            transactions,
            cursor: {
              hasNext,
              page: hasNext ? page : undefined
            }
          })
        })
        .catch(overallReject)
    })
  }

  public async getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>> {
    const statuses: [string, AirGapTransactionStatus][] = await Promise.all(
      transactionIds.map(async (txHash: string) => {
        return [txHash, await this.nodeClient.getTransactionStatus(txHash)]
      })
    )

    return statuses.reduce((obj, next) => Object.assign(obj, { [next[0]]: next[1] }), {})
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<_Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<_Units>> {
    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<_Units>> {
    const balances: BigNumber[] = await Promise.all(
      addresses.map((address: string) => {
        return this.nodeClient.fetchBalance(address)
      })
    )

    return {
      total: newAmount(
        balances.reduce((a: BigNumber, b: BigNumber) => a.plus(b)),
        'blockchain'
      )
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<EthereumUnits>
  ): Promise<Amount<_Units>> {
    const { total, transferable }: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)
    const balance = new BigNumber(newAmount(transferable ?? total).blockchain(this.units).value)

    let fee: Amount<EthereumUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<EthereumUnits> = await this.getTransactionFeeWithPublicKey(
        publicKey,
        to.map((recipient: string) => ({
          to: recipient,
          amount: newAmount(balance.div(to.length).decimalPlaces(0, BigNumber.ROUND_CEIL), 'blockchain')
        }))
      )
      fee = newAmount(estimatedFee.medium).blockchain(this.feeUnits)
      if (balance.lte(fee.value)) {
        fee = newAmount(0, 'blockchain')
      }
    }

    let amountWithoutFees: BigNumber = balance.minus(fee.value)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees, 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<EthereumUnits>> {
    if (details.length !== 1) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'you cannot have 0 transaction details')
    }
    const address: string = await this.getAddressFromPublicKey(publicKey)
    const estimatedGas: BigNumber = await this.estimateGas(address, details[0].to, newAmount(details[0].amount).blockchain(this.units))
    const gasPrice: BigNumber = await this.nodeClient.getGasPrice()
    const feeStepFactor: BigNumber = new BigNumber(0.5)
    const estimatedFee: BigNumber = estimatedGas.times(gasPrice)
    const lowFee: BigNumber = estimatedFee.minus(estimatedFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))
    const mediumFee: BigNumber = estimatedFee
    const highFee: BigNumber = mediumFee.plus(mediumFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))

    return {
      low: newAmount(lowFee, 'blockchain'),
      medium: newAmount(mediumFee, 'blockchain'),
      high: newAmount(highFee, 'blockchain')
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<EthereumUnits>
  ): Promise<EthereumUnsignedTransaction> {
    if (details.length !== 1) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'you cannot have 0 transaction details')
    }

    let fee: Amount<EthereumUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<EthereumUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.feeUnits).value)
    const wrappedAmount: BigNumber = new BigNumber(newAmount(details[0].amount).blockchain(this.units).value)

    const address: string = await this.getAddressFromPublicKey(publicKey)
    const hexAmount = EthereumUtils.toHex(wrappedAmount.toFixed())

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const availableBalance = newAmount(balance.transferable ?? balance.total).blockchain(this.units)
    const gasLimit = await this.estimateGas(address, details[0].to, hexAmount)
    const gasPrice = wrappedFee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
    if (new BigNumber(availableBalance.value).gte(wrappedAmount.plus(wrappedFee))) {
      const txCount = await this.nodeClient.fetchTransactionCount(address)
      const transaction: EthereumRawUnsignedTransaction = newUnsignedTransaction({
        ethereumType: 'raw',
        nonce: EthereumUtils.toHex(txCount),
        gasLimit: EthereumUtils.toHex(gasLimit.toFixed()),
        gasPrice: EthereumUtils.toHex(gasPrice.toFixed()), // 10 Gwei
        to: details[0].to,
        value: hexAmount,
        chainId: this.options.network.chainId,
        data: '0x'
      })

      return transaction
    } else {
      throw new BalanceError(Domain.ETHEREUM, 'not enough balance')
    }
  }

  public async broadcastTransaction(transaction: EthereumSignedTransaction): Promise<string> {
    return this.nodeClient.sendSignedTransaction(`0x${transaction.serialized.replace(/^0x/, '')}`)
  }

  // Custom

  private nonExtendedPublicKey(publicKey: PublicKey | ExtendedPublicKey): PublicKey {
    return publicKey.type === 'pub' ? publicKey : this.getPublicKeyFromExtendedPublicKey(publicKey)
  }

  private nonExtendedSecretKey(secretKey: SecretKey | ExtendedSecretKey): SecretKey {
    return secretKey.type === 'priv' ? secretKey : this.getSecretKeyFromExtendedSecretKey(secretKey)
  }

  private getPublicKeyFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number = 0,
    addressIndex: number = 0
  ): PublicKey {
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const derivedNode = this.deriveNode(encodedExtendedPublicKey.value, visibilityIndex, addressIndex)

    return newPublicKey(derivedNode.neutered().keyPair.getPublicKeyBuffer().toString('hex'), 'hex')
  }

  private getSecretKeyFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number = 0,
    addressIndex: number = 0
  ): SecretKey {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const derivedNode = this.deriveNode(encodedExtendedSecretKey.value, visibilityIndex, addressIndex)

    return newSecretKey(derivedNode.keyPair.getPrivateKeyBuffer().toString('hex'), 'hex')
  }

  private deriveNode(base58: string, visibilityIndex?: number, addressIndex?: number): any {
    return [visibilityIndex, addressIndex].reduce(
      (node, index) => node.derive(index),
      this.bitcoinJS.lib.HDNode.fromBase58(base58, this.bitcoinJS.config.network)
    )
  }

  protected async estimateGas(
    fromAddress: string,
    toAddress: string,
    amount: string | number | BigNumber | Amount<_Units>,
    data?: string
  ): Promise<BigNumber> {
    let hexAmount: string
    if (typeof amount === 'string' && isHex(amount)) {
      hexAmount = amount
    } else {
      const blockchainAmount: Amount<_Units> = isAmount(amount) ? newAmount(amount).blockchain(this.units) : newAmount(amount, 'blockchain')

      hexAmount = EthereumUtils.toHex(blockchainAmount.value)
    }

    return this.nodeClient.estimateTransactionGas(fromAddress, toAddress, hexAmount, data, EthereumUtils.toHex(MAX_GAS_ESTIMATE))
  }

  private derivativeToBip32Node(derivative: CryptoDerivative) {
    const bip32Node = encodeDerivative('bip32', derivative)

    return this.bitcoinJS.lib.HDNode.fromBase58(bip32Node.secretKey, this.bitcoinJS.config.network)
  }
}

export abstract class DefaultEthereumBaseProtocolImpl extends EthereumBaseProtocolImpl {
  protected constructor(
    nodeClient: EthereumNodeClient,
    infoClient: EthereumInfoClient,
    options: EthereumProtocolOptions & Partial<EthereumBaseProtocolOptions>
  ) {
    super(nodeClient, infoClient, {
      ...options,
      identifier: MainProtocolSymbols.ETH,
      name: 'Ethereum',

      units: DEFAULT_ETHEREUM_UNITS_METADATA,
      mainUnit: 'ETH'
    })
  }
}
