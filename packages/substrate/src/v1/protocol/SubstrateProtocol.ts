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
  CryptoDerivative,
  KeyPair,
  newAmount,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { SubstrateBlockExplorerClient } from '../block-explorer/SubstrateBlockExplorerClient'
import { SubstrateAccountController } from '../controller/account/SubstrateAccountController'
import { SubstrateTransactionController } from '../controller/transaction/SubstrateTransactionController'
import { SubstrateCryptoClient } from '../crypto/SubstrateCryptoClient'
import { SubstrateAccountId } from '../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../data/account/SubstrateAccountBalance'
import { SubstrateTransaction, SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateNodeClient } from '../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../types/configuration'
import { SubstrateCryptoConfiguration } from '../types/crypto'
import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '../types/protocol'
import {
  SubstrateSignedTransaction,
  SubstrateTransactionCursor,
  SubstrateTransactionDetails,
  SubstrateTransactionParameters,
  SubstrateUnsignedTransaction
} from '../types/transaction'
import { convertPublicKey, convertSecretKey } from '../utils/keys'
import { convertSignature } from '../utils/signature'

// Interface

export interface SubstrateProtocol<
  _ProtocolConfiguration extends SubstrateProtocolConfiguration = SubstrateProtocolConfiguration,
  _Units extends string = string,
  _ProtocolNetwork extends SubstrateProtocolNetwork = SubstrateProtocolNetwork,
  _CryptoConfiguration extends SubstrateCryptoConfiguration = SubstrateCryptoConfiguration
> extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: _ProtocolNetwork
      CryptoConfiguration: _CryptoConfiguration
      Units: _Units
      FeeEstimation: Amount<_Units>
      UnsignedTransaction: SubstrateUnsignedTransaction
      SignedTransaction: SubstrateSignedTransaction
      TransactionCursor: SubstrateTransactionCursor
    },
    'Crypto',
    'FetchDataForAddress'
  > {
  _isSubstrateProtocol: true

  encodeDetails(txs: SubstrateTransactionDetails<_ProtocolConfiguration>[]): Promise<string>
  decodeDetails(serialized: string): Promise<SubstrateTransactionDetails<_ProtocolConfiguration>[]>
}

// Implementation

export abstract class SubstrateProtocolImpl<
  _Units extends string,
  _ProtocolConfiguration extends SubstrateProtocolConfiguration,
  _ProtocolNetwork extends SubstrateProtocolNetwork = SubstrateProtocolNetwork,
  _NodeClient extends SubstrateNodeClient<_ProtocolConfiguration> = SubstrateNodeClient<_ProtocolConfiguration>,
  _AccountController extends SubstrateAccountController<_ProtocolConfiguration> = SubstrateAccountController<_ProtocolConfiguration>,
  _TransactionController extends SubstrateTransactionController<_ProtocolConfiguration> = SubstrateTransactionController<_ProtocolConfiguration>
> implements SubstrateProtocol<_ProtocolConfiguration, _Units, _ProtocolNetwork, SubstrateCryptoConfiguration<_ProtocolConfiguration>>
{
  public readonly _isSubstrateProtocol: true = true

  protected readonly configuration: _ProtocolConfiguration
  protected readonly cryptoConfiguration: SubstrateCryptoConfiguration<_ProtocolConfiguration>

  public readonly accountController: _AccountController
  public readonly transactionController: _TransactionController

  public readonly nodeClient: _NodeClient
  public readonly blockExplorer: SubstrateBlockExplorerClient

  private readonly cryptoClient: SubstrateCryptoClient

  protected constructor(
    options: SubstrateProtocolOptions<_Units, _ProtocolConfiguration, _ProtocolNetwork>,
    nodeClient: _NodeClient,
    accountController: _AccountController,
    transactionController: _TransactionController,
    blockExplorer: SubstrateBlockExplorerClient
  ) {
    this.metadata = options.metadata
    this.network = options.network
    this.configuration = options.configuration
    this.cryptoConfiguration = (
      this.configuration.account.type === 'ss58'
        ? {
            algorithm: 'sr25519',
            compatibility: 'substrate'
          }
        : {
            algorithm: 'secp256k1'
          }
    ) as SubstrateCryptoConfiguration<_ProtocolConfiguration>

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

  public async getCryptoConfiguration(): Promise<SubstrateCryptoConfiguration<_ProtocolConfiguration>> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.accountController.createKeyPairFromDerivative(derivative)
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

    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const bufferSecretKey: Buffer = Buffer.from(hexSecretKey.value, 'hex').slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.encryptAES(payload, bufferSecretKey.toString('hex'))
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    // https://github.com/w3f/schnorrkel/blob/master/src/keys.rs
    // https://github.com/polkadot-js/wasm/blob/master/packages/wasm-crypto/src/sr25519.rs
    const bufferSecretKey: Buffer = Buffer.from(hexSecretKey.value, 'hex').slice(0, 32) // Substrate key is 32 bytes key + 32 bytes nonce

    return this.cryptoClient.decryptAES(payload, bufferSecretKey.toString('hex'))
  }

  // Online

  protected readonly network: _ProtocolNetwork

  public async getNetwork(): Promise<_ProtocolNetwork> {
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

    // TODO: use `count` in API response to determine if there's more
    const hasNext = transactions.length >= limit

    return {
      transactions,
      cursor: {
        hasNext: transactions.length >= limit,
        page: hasNext ? (cursor?.page ?? 0) + 1 : undefined
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
    configuration?: TransactionFullConfiguration<_Units>
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

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<Amount<_Units>> {
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
    configuration?: TransactionFullConfiguration<_Units>
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

  public async encodeDetails(txs: SubstrateTransactionDetails<_ProtocolConfiguration>[]): Promise<string> {
    return this.transactionController.encodeDetails(txs)
  }

  public async decodeDetails(serialized: string): Promise<SubstrateTransactionDetails<_ProtocolConfiguration>[]> {
    return this.decodeDetails(serialized)
  }

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
          amount: newAmount<_Units>(part.amount ? part.amount?.value : '0', 'blockchain'),
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
