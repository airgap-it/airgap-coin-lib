import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import * as BitGo from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src'
import { BalanceError, ConditionViolationError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  TransactionDetails,
  TransactionFullConfiguration,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import Client from 'mina-signer'

import { MinaExplorerIndexer } from '../indexer/MinaExplorerIndexer'
import { MinaIndexer } from '../indexer/MinaIndexer'
import { GraphQLNode } from '../node/GraphQLNode'
import { MinaNode } from '../node/MinaNode'
import { MinaCryptoConfiguration } from '../types/crypto'
import { ACCOUNT_TRANSFER_KIND, AccountTransaction } from '../types/indexer'
import { AccountBalance } from '../types/node'
import { MinaNetworkType, MinaProtocolNetwork, MinaProtocolOptions, MinaUnits } from '../types/protocol'
import { MinaPayment, MinaSignedTransaction, MinaTransactionCursor, MinaUnsignedTransaction } from '../types/transaction'
import { derivePublicKey, finalizeSecretKey } from '../utils/key'
import { quantile } from '../utils/math'

// Interface

export interface MinaProtocol
  extends AirGapProtocol<{
    AddressResult: Address
    ProtocolNetwork: MinaProtocolNetwork
    CryptoConfiguration: MinaCryptoConfiguration
    Units: MinaUnits
    FeeEstimation: FeeDefaults<MinaUnits>
    SignedTransaction: MinaSignedTransaction
    UnsignedTransaction: MinaUnsignedTransaction
    TransactionCursor: MinaTransactionCursor
  }> {}

// Implementation

export class MinaProtocolImpl implements MinaProtocol {
  private readonly options: MinaProtocolOptions
  private readonly node: MinaNode
  private readonly indexer: MinaIndexer

  private readonly bitcoinJS: {
    lib: any
    config: {
      network: any
    }
  } = {
    lib: BitGo,
    config: { network: BitGo.networks.bitcoin }
  }

  public constructor(options: RecursivePartial<MinaProtocolOptions> = {}, node?: MinaNode, indexer?: MinaIndexer) {
    this.options = createMinaProtocolOptions(options.network)
    this.node = node ?? new GraphQLNode(this.options.network.rpcUrl)
    this.indexer = indexer ?? new MinaExplorerIndexer(this.options.network.blockExplorerApi)
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<MinaUnits> = {
    MINA: {
      symbol: { value: 'MINA' },
      decimals: 9
    }
  }

  public readonly metadata: ProtocolMetadata<MinaUnits> = {
    identifier: MainProtocolSymbols.MINA,
    name: 'Mina',

    units: this.units,
    mainUnit: 'MINA',

    account: {
      standardDerivationPath: `m/44'/12586'/0'/0/0`,
      address: {
        isCaseSensitive: true,
        regex: '^B62[a-km-zA-HJ-NP-Z1-9]{52}$',
        placeholder: 'B62...'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<MinaUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return publicKey.value
  }

  public async getDetailsFromTransaction(
    transaction: MinaSignedTransaction | MinaUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<MinaUnits>[]> {
    return this.getDetailsFromMinaPayment(publicKey, transaction.data)
  }

  private getDetailsFromMinaPayment(publicKey: PublicKey, payment: MinaPayment): AirGapTransaction<MinaUnits>[] {
    return [
      {
        from: [payment.from],
        to: [payment.to],
        isInbound: payment.to === publicKey.value,
        amount: newAmount(payment.amount, 'blockchain'),
        fee: newAmount(payment.fee, 'blockchain'),
        arbitraryData: payment.memo,
        network: this.options.network
      }
    ]
  }

  // Offline

  private readonly cryptoConfiguration: MinaCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public async getCryptoConfiguration(): Promise<MinaCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const node = this.derivativeToBip32Node(derivative)
    const secretKey: SecretKey = finalizeSecretKey(node.keyPair.getPrivateKeyBuffer())

    return {
      secretKey,
      publicKey: derivePublicKey(this.getMinaClient(), secretKey)
    }
  }

  public async signTransactionWithSecretKey(transaction: MinaUnsignedTransaction, secretKey: SecretKey): Promise<MinaSignedTransaction> {
    const client: Client = this.getMinaClient(transaction.networkType)
    const signed = client.signPayment(
      {
        to: transaction.data.to,
        from: transaction.data.from,
        amount: transaction.data.amount,
        fee: transaction.data.fee,
        nonce: transaction.data.nonce,
        memo: transaction.data.memo,
        validUntil: transaction.data.validUntil
      },
      secretKey.value
    )

    return newSignedTransaction<MinaSignedTransaction>({
      data: {
        to: signed.data.to,
        from: signed.data.from,
        amount: signed.data.amount.toString(),
        fee: signed.data.fee.toString(),
        nonce: signed.data.nonce.toString(),
        memo: signed.data.memo,
        validUntil: signed.data.validUntil?.toString()
      },
      signature: {
        type: 'legacy',
        field: signed.signature.field,
        scalar: signed.signature.scalar
      }
    })
  }

  // Online

  public async getNetwork(): Promise<MinaProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: MinaTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<MinaTransactionCursor, MinaUnits>> {
    const transactions: AccountTransaction[] = await this.indexer.getTransactions(publicKey.value, limit, cursor?.lastDateTime)

    const lastDateTime: string | undefined = transactions[transactions.length - 1].dateTime
    const hasNext: boolean = transactions.length >= limit

    const airGapTransactions: AirGapTransaction<MinaUnits>[] = transactions.map((transaction: AccountTransaction) => ({
      from: [transaction.from],
      to: [transaction.to],
      isInbound: transaction.to === publicKey.value,
      amount: newAmount(transaction.amount, 'blockchain'),
      fee: newAmount(transaction.fee, 'blockchain'),
      arbitraryData: transaction.memo,
      network: this.options.network,
      type: transaction.kind !== ACCOUNT_TRANSFER_KIND ? transaction.kind : undefined,
      timestamp: Date.parse(transaction.dateTime),
      status: {
        type: transaction.hash ? 'applied' : transaction.failureReason ? 'failed' : 'unknown',
        hash: transaction.hash
      }
    }))

    return {
      transactions: airGapTransactions,
      cursor: {
        hasNext,
        lastDateTime
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<MinaUnits>> {
    const balance: AccountBalance = await this.node.getBalance(publicKey.value)

    return {
      total: newAmount(balance.total, 'blockchain'),
      transferable: newAmount(balance.liquid, 'blockchain')
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    _to: string[],
    configuration?: TransactionFullConfiguration<MinaUnits>
  ): Promise<Amount<MinaUnits>> {
    const balance: AccountBalance = await this.node.getBalance(publicKey.value)
    const fee = configuration?.fee ? newAmount(configuration.fee).blockchain(this.units).value : '0'

    const maxAmount = new BigNumber(balance.liquid).minus(fee)

    return newAmount(maxAmount, 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<MinaUnits>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<MinaUnits>> {
    const fees: string[] = await this.indexer.getLatestFees(20)
    const feesQuantile = (q: number): BigNumber =>
      quantile(fees, q, {
        isSorted: true /* `getLatestFees` returns an already sorted (ASC) list */,
        roundingMode: BigNumber.ROUND_CEIL
      })

    return {
      low: newAmount(feesQuantile(0.25), 'blockchain'),
      medium: newAmount(feesQuantile(0.5), 'blockchain'),
      high: newAmount(feesQuantile(0.75), 'blockchain')
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<MinaUnits>[],
    configuration?: TransactionFullConfiguration<MinaUnits>
  ): Promise<MinaUnsignedTransaction> {
    if (details.length !== 1) {
      throw new ConditionViolationError(Domain.MINA, 'Multiple transactions not supported.')
    }

    const paymentDetails: TransactionDetails<MinaUnits> = details[0]
    const nonce: string = await this.node.getNonce(publicKey.value)
    const fee: Amount<MinaUnits> =
      configuration?.fee ?? (await this.getTransactionFeeWithPublicKey(publicKey, details, configuration)).medium

    const balance: Balance<MinaUnits> = await this.getBalanceOfPublicKey(publicKey)

    const amountBlockchain: Amount<MinaUnits> = newAmount(paymentDetails.amount).blockchain(this.units)
    const feeBlockchain: Amount<MinaUnits> = newAmount(fee).blockchain(this.units)
    const transferableBlockchain: Amount<MinaUnits> = newAmount(balance.transferable ?? balance.total).blockchain(this.units)

    if (new BigNumber(transferableBlockchain.value).minus(amountBlockchain.value).minus(feeBlockchain.value).lt(0)) {
      throw new BalanceError(Domain.MINA, 'Insfficient balance.')
    }

    return newUnsignedTransaction<MinaUnsignedTransaction>({
      networkType: this.options.network.minaType,
      data: {
        to: paymentDetails.to,
        from: publicKey.value,
        amount: amountBlockchain.value,
        fee: feeBlockchain.value,
        nonce,
        memo: paymentDetails.arbitraryData
      }
    })
  }

  public async broadcastTransaction(transaction: MinaSignedTransaction): Promise<string> {
    return this.node.sendTransaction(transaction.data, transaction.signature)
  }

  // Custom

  private getMinaClient(network: MinaNetworkType = this.options.network.minaType): Client {
    return new Client({ network })
  }

  private derivativeToBip32Node(derivative: CryptoDerivative) {
    const bip32Node = encodeDerivative('bip32', derivative)

    return this.bitcoinJS.lib.HDNode.fromBase58(bip32Node.secretKey, this.bitcoinJS.config.network)
  }
}

// Factory

export function createMinaProtocol(options: RecursivePartial<MinaProtocolOptions> = {}): MinaProtocol {
  return new MinaProtocolImpl(options)
}

export const MINA_MAINNET_PROTOCOL_NETWORK: MinaProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://proxy.minaexplorer.com',
  blockExplorerUrl: 'https://minaexplorer.com/',
  blockExplorerApi: 'https://graphql.minaexplorer.com',
  minaType: 'mainnet'
}

export const MINA_TESTNET_PROTOCOL_NETWORK: MinaProtocolNetwork = {
  name: 'Devnet',
  type: 'testnet',
  rpcUrl: 'https://proxy.devnet.minaexplorer.com',
  blockExplorerUrl: 'https://devnet.minaexplorer.com',
  blockExplorerApi: 'https://devnet.graphql.minaexplorer.com',
  minaType: 'testnet'
}

const DEFAULT_MINA_PROTOCOL_NETWORK: MinaProtocolNetwork = MINA_MAINNET_PROTOCOL_NETWORK

export function createMinaProtocolOptions(network: Partial<MinaProtocolNetwork> = {}): MinaProtocolOptions {
  return {
    network: { ...DEFAULT_MINA_PROTOCOL_NETWORK, ...network }
  }
}
