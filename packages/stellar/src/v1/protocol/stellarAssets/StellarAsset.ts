import { assertNever, Domain, MainProtocolSymbols, NetworkError } from '@airgap/coinlib-core'
import {
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  KeyPair,
  ProtocolMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  SubProtocolType,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration,
  Address,
  FeeDefaults,
  newAmount,
  newUnsignedTransaction
} from '@airgap/module-kit'
import {
  StellarAssetMetadata,
  StellarProtocolNetwork,
  StellarProtocolOptions,
  StellarTransactionType,
  StellarUnits
} from '../../types/protocol'
import { StellarCryptoConfiguration } from '../../types/crypto'
import { StellarSignedTransaction, StellarTransactionCursor, StellarUnsignedTransaction } from '../../types/transaction'
import { createStellarProtocol, createStellarProtocolOptions, StellarProtocol } from '../StellarProtocol'
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { Asset, BASE_FEE, Memo, Networks, Operation, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

export interface StellarAssetProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: StellarProtocolNetwork
      CryptoConfiguration: StellarCryptoConfiguration
      SignedTransaction: StellarSignedTransaction
      TransactionCursor: StellarTransactionCursor
      FeeEstimation: FeeDefaults<StellarUnits>
      UnsignedTransaction: StellarUnsignedTransaction
    },
    'SubProtocol',
    'FetchDataForAddress'
  > {
  metadata: StellarAssetMetadata
  getTrustBalance(publicKey: PublicKey): Promise<Balance<string>>
  setTrustline(publicKey: PublicKey, assetMeta: StellarAssetMetadata, limit?: string): Promise<StellarUnsignedTransaction>
}

class StellarAssetProtocolImpl implements StellarAssetProtocol {
  private readonly stellar: StellarProtocol
  public readonly metadata: StellarAssetMetadata

  public constructor(metadata: StellarAssetMetadata, options: RecursivePartial<StellarProtocolOptions>) {
    const completeOptions = createStellarProtocolOptions(options.network)
    this.metadata = metadata
    this.stellar = createStellarProtocol(completeOptions)
  }

  public async getCryptoConfiguration(): Promise<StellarCryptoConfiguration> {
    return this.stellar.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.stellar.getKeyPairFromDerivative(derivative)
  }

  public async signTransactionWithSecretKey(
    transaction: StellarUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<StellarSignedTransaction> {
    return this.stellar.signTransactionWithSecretKey(transaction, secretKey)
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return this.stellar.getAddressFromPublicKey(publicKey)
  }

  public getDetailsFromTransaction(
    transaction: StellarSignedTransaction | StellarUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<string>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromEncodedTransaction(transaction.transaction, publicKey)
      case 'unsigned':
        return this.getDetailsFromEncodedTransaction(transaction.transaction, publicKey)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.STELLAR, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromEncodedTransaction(transaction: string, publicKey: any): Promise<AirGapTransaction<string>[]> {
    const transactions: AirGapTransaction<StellarUnits>[] = []

    const tx = TransactionBuilder.fromXDR(transaction, Networks.PUBLIC) as Transaction

    for (const txDetails of tx.operations) {
      let amount: string
      let op: Operation.Payment | Operation.ChangeTrust

      let to: string
      let fee: string
      let isInbound
      let type: string | undefined

      if (txDetails.type === StellarTransactionType.PAYMENT) {
        op = txDetails as Operation.Payment
        amount = new BigNumber(op.amount).multipliedBy(this.metadata.decimals).toString()
        fee = tx.fee
        to = op.destination
        type = StellarTransactionType.PAYMENT
        isInbound = to.toLowerCase() === publicKey.value.toLowerCase()
      } else if (txDetails.type === StellarTransactionType.CHANGE_TRUST) {
        op = txDetails as Operation.ChangeTrust
        amount = new BigNumber(0).toString()
        const asetType = op.line as Asset
        to = asetType.getIssuer()
        fee = new BigNumber(tx.fee).dividedBy(tx.operations.length).toString()
        isInbound = to.toLowerCase() === publicKey.value.toLowerCase()
        type = StellarTransactionType.CHANGE_TRUST
      } else {
        throw new UnsupportedError(Domain.STELLAR, 'Unsupported operation type.')
      }

      const memo =
        tx.memo.type === 'text' || tx.memo.type === 'id'
          ? tx.memo.value?.toString()
          : tx.memo.type === 'hash' || tx.memo.type === 'return'
            ? tx.memo.value?.toString('hex')
            : undefined

      transactions.push({
        from: [tx.source],
        to: [to || ''],
        isInbound,
        amount: newAmount(amount, 'blockchain'),
        fee: newAmount(fee, 'blockchain'),
        network: this.stellar.options.network,
        arbitraryData: memo,
        type,
        json: JSON.stringify(tx)
      })
    }

    return transactions
  }

  public async getNetwork(): Promise<StellarProtocolNetwork> {
    return this.stellar.getNetwork()
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: StellarTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<StellarTransactionCursor, StellarUnits>> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey, configuration?: undefined): Promise<Balance<StellarUnits>> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddress(address)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: Address[],
    configuration?: TransactionFullConfiguration<StellarUnits> | undefined
  ): Promise<Amount<StellarUnits>> {
    try {
      const balance = await this.getBalanceOfPublicKey(publicKey)

      return newAmount(balance.total.value, 'blockchain')
    } catch (error) {
      throw new NetworkError(Domain.STELLAR, error)
    }
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<StellarUnits>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<StellarUnits>> {
    return this.stellar.getTransactionFeeWithPublicKey(publicKey, details as TransactionDetails<StellarUnits>[], configuration)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<StellarUnits>[],
    configuration?: TransactionFullConfiguration<StellarUnits> | undefined
  ): Promise<StellarUnsignedTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)

    const account = await this.stellar.server.loadAccount(address)

    const fee = configuration?.fee !== undefined ? configuration?.fee?.value : BASE_FEE

    const txBuilder = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.PUBLIC
    })

    for (const detail of details) {
      let destinationExists = true
      try {
        await this.stellar.server.loadAccount(detail.to)
      } catch (e) {
        if (e.response?.status === 404) {
          destinationExists = false
        } else {
          throw e
        }
      }

      const divisor = new BigNumber(10).exponentiatedBy(Number(this.metadata.decimals))

      const amount = new BigNumber(detail.amount.value).dividedBy(divisor).toString()

      if (destinationExists) {
        txBuilder.addOperation(
          Operation.payment({
            destination: detail.to,
            asset: new Asset(this.metadata.assetCode, this.metadata.issuer),
            amount
          })
        )
      } else {
        throw new UnsupportedError(Domain.STELLAR, `Destination account ${detail.to} does not exist.`)
      }
    }

    if (configuration?.arbitraryData) {
      const memo = configuration?.arbitraryData

      txBuilder.addMemo(Memo.id(memo))
    }

    const tx = txBuilder.setTimeout(600).build()

    return newUnsignedTransaction<StellarUnsignedTransaction>({
      transaction: tx.toXDR()
    })
  }

  public async broadcastTransaction(transaction: StellarSignedTransaction): Promise<string> {
    return this.stellar.broadcastTransaction(transaction)
  }

  public async getTransactionsForAddress(
    address: Address,
    limit: number,
    cursor?: StellarTransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<StellarTransactionCursor, StellarUnits>> {
    try {
      const endpoint = cursor?.next ?? `/accounts/${address}/payments?limit=${100}&order=desc&join=transactions`
      const url = `${this.stellar.options.network.rpcUrl}${endpoint}`

      const response = await axios.get(url)
      const data = response.data
      const paymentTransactions = data._embedded?.records ?? []

      const divisor = new BigNumber(10).exponentiatedBy(Number(this.metadata.decimals))

      const transactions: AirGapTransaction<StellarUnits>[] = paymentTransactions
        .filter(
          (tx: any) =>
            (tx.type === 'payment' || tx.type === 'path_payment_strict_send' || tx.type == undefined) &&
            tx.asset_code === this.metadata.assetCode &&
            tx.asset_issuer === this.metadata.issuer
        )
        .map((tx: any) => {
          const txData = tx.transaction
          const amount = new BigNumber(tx.amount).multipliedBy(divisor).toString()

          const isInbound = tx.to.toLowerCase() === address.toLowerCase()

          return {
            from: [tx.from],
            to: [tx.to],
            isInbound,
            amount: newAmount(amount, 'blockchain'),
            fee: newAmount(txData.fee_charged, 'blockchain'),
            network: this.stellar.options.network,
            timestamp: Math.floor(new Date(tx.created_at).getTime() / 1000),
            status: {
              type: tx.transaction_successful ? 'applied' : 'failed',
              hash: tx.transaction_hash,
              block: txData.ledger.toString()
            },
            arbitraryData: txData.memo
          }
        })

      return {
        transactions,
        cursor: {
          hasNext: data._links?.next?.href !== undefined,
          next: data._links?.next?.href?.replace(this.stellar.options.network.rpcUrl, '') ?? ''
        }
      }
    } catch (error) {
      return {
        transactions: [],
        cursor: {
          hasNext: false,
          next: ''
        }
      }
    }
  }

  public async getBalanceOfAddress(address: Address, configuration?: undefined): Promise<Balance<StellarUnits>> {
    try {
      const account = await this.stellar.server.loadAccount(address)

      const balanceEntry = account.balances.find(
        (b): b is HorizonApi.BalanceLineAsset<'credit_alphanum4'> | HorizonApi.BalanceLineAsset<'credit_alphanum12'> =>
          (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') &&
          b.asset_code === this.metadata.assetCode &&
          b.asset_issuer === this.metadata.issuer
      )

      const divisor = new BigNumber(10).exponentiatedBy(Number(this.metadata.decimals))

      const btnBalance = new BigNumber(balanceEntry?.balance ?? 0).multipliedBy(divisor).toString()

      return {
        total: newAmount(btnBalance, 'blockchain')
      }
    } catch (error) {
      return {
        total: newAmount('0', 'blockchain')
      }
    }
  }

  // SubProtocol

  public async getType(): Promise<SubProtocolType> {
    return 'token'
  }

  public async mainProtocol(): Promise<string> {
    return MainProtocolSymbols.STELLAR
  }

  public async getMetadata(): Promise<ProtocolMetadata<string>> {
    const stellarMetadata = await this.stellar.getMetadata()

    return {
      ...stellarMetadata,
      name: this.metadata.name,
      identifier: this.metadata.identifier,
      units: {
        [this.metadata.assetCode]: {
          symbol: { value: this.metadata.assetCode },
          decimals: this.metadata.decimals
        }
      },
      mainUnit: this.metadata.assetCode
    }
  }

  public async getTrustBalance(publicKey: PublicKey): Promise<Balance<string>> {
    const address = await this.getAddressFromPublicKey(publicKey)

    try {
      const account = await this.stellar.server.loadAccount(address)

      const balanceEntry = account.balances.find(
        (b): b is HorizonApi.BalanceLineAsset<'credit_alphanum4'> | HorizonApi.BalanceLineAsset<'credit_alphanum12'> =>
          (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') &&
          b.asset_code === this.metadata.assetCode &&
          b.asset_issuer === this.metadata.issuer
      )

      const btnBalance = new BigNumber(balanceEntry?.limit ?? 0).toString()

      return {
        total: newAmount(btnBalance, 'blockchain')
      }
    } catch (error) {
      return {
        total: newAmount('0', 'blockchain')
      }
    }
  }

  public async setTrustline(publicKey: PublicKey, assetMeta: StellarAssetMetadata, limit?: string): Promise<StellarUnsignedTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)

    const account = await this.stellar.server.loadAccount(address)

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC
    })

    txBuilder.addOperation(
      Operation.changeTrust({
        asset: new Asset(assetMeta.assetCode, assetMeta.issuer),
        limit: limit ? limit : undefined
      })
    )

    const tx = txBuilder.setTimeout(600).build()

    return newUnsignedTransaction<StellarUnsignedTransaction>({
      transaction: tx.toXDR()
    })
  }
}

export function createStellarAssetProtocol(
  metadata: StellarAssetMetadata,
  options: RecursivePartial<StellarProtocolOptions> = {}
): StellarAssetProtocol {
  return new StellarAssetProtocolImpl(metadata, options)
}
