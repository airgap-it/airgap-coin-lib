import { Domain, NetworkError } from '@airgap/coinlib-core'
import { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { OperationFailedError } from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeEstimation,
  KeyPair,
  newAmount,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  Secret,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'
import { SubstrateBlockExplorer } from '../block-explorer/SubstrateBlockExplorer'
import { SubstrateAccountController } from '../controller/account/SubstrateAccountController'
import { SubstrateTransactionController, SubstrateTransactionParameters } from '../controller/transaction/SubstrateTransactionController'
import { SubstrateCryptoClient } from '../crypto/SubstrateCryptoClient'
import { SubstrateAccountId } from '../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../data/account/SubstrateAccountBalance'
import { SubstrateTransaction, SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateNodeClient } from '../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../types/configuration'
import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '../types/protocol'
import { SubstrateSignedTransaction, SubstrateTransactionCursor, SubstrateUnsignedTransaction } from '../types/transaction'
import { convertPublicKey, convertSecretKey } from '../utils/keys'
import { convertSignature } from '../utils/signature'

// Interface

export interface SubstrateProtocol<_Units extends string>
  extends AirGapProtocol<{
    AddressResult: Address
    ProtocolNetwork: SubstrateProtocolNetwork
    Units: _Units
    UnsignedTransaction: SubstrateUnsignedTransaction
    SignedTransaction: SubstrateSignedTransaction
    TransactionCursor: SubstrateTransactionCursor
  }> {}

// Implementation

export abstract class SubstrateProtocolImpl<
  _Units extends string,
  _ProtocolConfiguration extends SubstrateProtocolConfiguration,
  _NodeClient extends SubstrateNodeClient<_ProtocolConfiguration> = SubstrateNodeClient<_ProtocolConfiguration>,
  _AccountController extends SubstrateAccountController<_ProtocolConfiguration> = SubstrateAccountController<_ProtocolConfiguration>,
  _TransactionController extends SubstrateTransactionController<_ProtocolConfiguration> = SubstrateTransactionController<_ProtocolConfiguration>
> implements SubstrateProtocol<_Units>
{
  protected readonly configuration: _ProtocolConfiguration

  private readonly accountController: _AccountController
  private readonly transactionController: _TransactionController

  private readonly nodeClient: _NodeClient
  private readonly blockExplorer: SubstrateBlockExplorer

  private readonly cryptoClient: SubstrateCryptoClient

  protected constructor(
    options: SubstrateProtocolOptions<_Units, _ProtocolConfiguration>,
    nodeClient: _NodeClient,
    accountController: _AccountController,
    transactionController: _TransactionController,
    blockExplorer: SubstrateBlockExplorer
  ) {
    this.metadata = options.metadata
    this.network = options.network
    this.configuration = options.configuration

    this.accountController = accountController
    this.transactionController = transactionController

    this.nodeClient = nodeClient
    this.blockExplorer = blockExplorer

    this.cryptoClient = new SubstrateCryptoClient()
  }

  // Common

  protected readonly metadata: ProtocolMetadata<_Units>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, _Units>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    const address: TypedSubstrateAddress<_ProtocolConfiguration> = this.accountController.createAddressFromPublicKey(publicKey)

    return address.asString()
  }

  public async getDetailsFromTransaction(
    transaction: SubstrateUnsignedTransaction | SubstrateSignedTransaction,
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units>[]> {
    return this.getDetailsFromEncodedTransaction(transaction.encoded)
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    const hexSignature: Signature = convertSignature(signature, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.verifyMessage(message, hexSignature.value, hexPublicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  // Offline

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair> {
    return this.accountController.createKeyPairFromSecret(secret, derivationPath)
  }

  public async signTransactionWithSecretKey(
    transaction: SubstrateUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<SubstrateSignedTransaction> {
    const txs = this.transactionController.decodeDetails(transaction.encoded)
    const signed = await Promise.all(txs.map((tx) => this.transactionController.signTransaction(secretKey, tx.transaction, tx.payload)))

    txs.forEach((tx, index) => (tx.transaction = signed[index]))

    return newSignedTransaction<SubstrateSignedTransaction>({ encoded: this.transactionController.encodeDetails(txs) })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(keyPair.publicKey, 'hex')
    const signature: string = await this.cryptoClient.signMessage(message, {
      publicKey: hexPublicKey.value,
      privateKey: hexSecretKey.value
    })

    return newSignature(signature, 'hex')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(keyPair.publicKey, 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, {
      privateKey: hexSecretKey.value,
      publicKey: hexPublicKey.value
    })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.encryptAES(payload, hexSecretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.decryptAES(payload, hexSecretKey.value)
  }

  // Online

  protected readonly network: SubstrateProtocolNetwork

  public async getNetwork(): Promise<SubstrateProtocolNetwork> {
    return this.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<SubstrateTransactionCursor, _Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<SubstrateTransactionCursor, _Units>> {
    const txs: Partial<AirGapTransaction<_Units>>[] = await this.blockExplorer.getTransactions(
      address,
      this.metadata.mainUnit,
      limit,
      cursor
    )

    const transactions: AirGapTransaction<_Units>[] = txs.map((tx) => ({
      from: [],
      to: [],
      isInbound: false,
      network: this.network,
      ...tx,
      amount: tx.amount ? tx.amount : newAmount('', 'blockchain'),
      fee: tx.fee ? tx.fee : newAmount('', 'blockchain')
    }))

    return {
      transactions,
      cursor: {
        hasNext: transactions.length >= limit,
        page: cursor?.page ? cursor.page + 1 : 1
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<_Units>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<_Units>> {
    const balance = await this.accountController.getBalance(address)

    return {
      total: newAmount(balance.total, 'blockchain'),
      transferable: newAmount(balance.transferable, 'blockchain')
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<_Units>
  ): Promise<Amount<_Units>> {
    const [balance, futureRequiredTransactions]: [SubstrateAccountBalance, [SubstrateTransactionType<_ProtocolConfiguration>, any][]] =
      await Promise.all([this.accountController.getBalance(publicKey), this.getFutureRequiredTransactions(publicKey, 'transfer')])

    const fee: BigNumber | undefined = await this.transactionController.estimateTransactionFees(publicKey, futureRequiredTransactions)

    if (!fee) {
      throw new OperationFailedError(Domain.SUBSTRATE, 'Could not estimate max value')
    }

    let maxAmount: BigNumber = balance.transferable.minus(configuration?.keepMinBalance ? balance.existentialDeposit : 0).minus(fee)

    if (maxAmount.lt(0)) {
      maxAmount = new BigNumber(0)
    }

    return newAmount(maxAmount, 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails<_Units>[]): Promise<FeeEstimation<_Units>> {
    const fees: BigNumber[] = await Promise.all(
      details.map(async (details: TransactionDetails<_Units>) => {
        const transaction: SubstrateTransaction<_ProtocolConfiguration> = await this.transactionController.createTransaction(
          'transfer',
          publicKey,
          0,
          {
            to: details.to.length > 0 ? details.to : publicKey,
            value: new BigNumber(newAmount(details.amount).blockchain(this.metadata.units).value)
          }
        )

        const fee: BigNumber | undefined = await this.transactionController.calculateTransactionFee(transaction)

        if (!fee) {
          throw new OperationFailedError(Domain.SUBSTRATE, 'Could not fetch all necessary data.')
        }

        return fee
      })
    )

    return newAmount(
      fees.reduce((acc: BigNumber, next: BigNumber) => acc.plus(next)),
      'blockchain'
    )
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionConfiguration<_Units>
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)
    const transferableBalance: BigNumber = balance.transferable.minus(configuration?.keepMinBalance ? balance.existentialDeposit : 0)

    const totalValue = details
      .map((details: TransactionDetails<_Units>) => new BigNumber(newAmount(details.amount).blockchain(this.metadata.units).value))
      .reduce((total, next) => total.plus(next), new BigNumber(0))

    const available = new BigNumber(transferableBalance).minus(totalValue)

    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      available,
      details.map(
        ({ to, amount }: TransactionDetails<_Units>): SubstrateTransactionParameters<_ProtocolConfiguration> => ({
          type: 'transfer',
          tip: 0, // temporary, until we handle Substrate fee/tip model
          args: {
            to,
            value: new BigNumber(newAmount(amount).blockchain(this.metadata.units).value)
          }
        })
      )
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async broadcastTransaction(transaction: SubstrateSignedTransaction): Promise<string> {
    const txs: [number | undefined, SubstrateTransaction<_ProtocolConfiguration>][] = this.transactionController
      .decodeDetails(transaction.encoded)
      .map((tx) => [tx.runtimeVersion, tx.transaction])

    const txHashes = await Promise.all(
      txs.map((tx) => this.nodeClient.submitTransaction(tx[1].encode({ configuration: this.configuration, runtimeVersion: tx[0] })))
    ).catch((error) => {
      throw new NetworkError(Domain.SUBSTRATE, error as AxiosError)
    })

    return txHashes[0]
  }

  // Custom

  private getDetailsFromEncodedTransaction(encoded: string): AirGapTransaction<_Units>[] {
    const txs = this.transactionController.decodeDetails(encoded)

    return txs
      .map((tx) => {
        return tx.transaction.toAirGapTransactions().map((part) => ({
          from: [],
          to: [],
          network: this.network,
          isInbound: false,
          ...part,
          amount: newAmount<_Units>(part.amount ? part.amount?.value : '', 'blockchain'),
          fee: newAmount<_Units>(part.fee ? part.fee.value : tx.fee.toString(), 'blockchain')
        }))
      })
      .reduce((flatten, toFlatten) => flatten.concat(toFlatten), [])
  }

  protected abstract getFutureRequiredTransactions(
    accountId: SubstrateAccountId<TypedSubstrateAddress<_ProtocolConfiguration>>,
    intention: 'check' | 'transfer'
  ): Promise<[SubstrateTransactionType<_ProtocolConfiguration>, any][]>
}
